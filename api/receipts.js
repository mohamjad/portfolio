const DEFAULT_MARKET = "US";
const DEFAULT_MODE = "exploit";
const DEFAULT_LIMIT = 24;
const REQUEST_TIMEOUT_MS = 18000;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toArray = (value) => (Array.isArray(value) ? value : []);

const toNumber = (value, fallback = null) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeKey = (value) => String(value || "").trim().toLowerCase();

const normalizeReason = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim();

const toDecision = (verdict, forceDns = false) => {
  const text = String(verdict || "").toLowerCase();
  if (text.includes("high_conviction") || text === "fund" || text === "shoot") return "Fund";
  if (text.includes("watch") || text === "hold") return "Hold";
  if (text.includes("do_not_shoot") || text === "dns") return "DNS";
  return forceDns ? "DNS" : "Hold";
};

const tagsFromLabel = (label, market, mode, trajectory = "") => {
  const normalized = String(label || "").toLowerCase();
  const tags = new Set(["general"]);

  if (market) tags.add(String(market).toLowerCase());
  if (mode) tags.add(String(mode).toLowerCase());

  if (/makeup|grwm|beauty|cosmetic|lip|blush|concealer|foundation|mascara|eyeshadow|skincare/.test(normalized)) {
    tags.add("makeup");
    tags.add("cosmetics");
  }

  if (/apparel|retail|fashion|outfit|coquette|streetwear|burberry|ecommerce/.test(normalized)) {
    tags.add("apparel_retail_ecommerce");
  }

  if (/jp|japan|jbeauty/.test(normalized)) tags.add("jp_derived");
  if (/kr|korea|kbeauty/.test(normalized)) tags.add("kr_derived");
  if (/trend|spike|accelerat|breakout/.test(normalized)) tags.add("trending");
  if (/saturat|declin|stale|cool/.test(normalized) || /declining|stabilizing/.test(String(trajectory).toLowerCase())) {
    tags.add("saturations");
  }

  return Array.from(tags);
};

const compactLabel = (value) =>
  String(value || "Unlabeled cluster")
    .replace(/@\w+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);

const buildIndex = (rows) => {
  const map = new Map();
  toArray(rows).forEach((row) => {
    const keys = [row.cluster_id, row.cluster_key, row.cluster_label]
      .map(normalizeKey)
      .filter(Boolean);
    keys.forEach((key) => {
      if (!map.has(key)) map.set(key, row);
    });
  });
  return map;
};

const firstRowByKeys = (index, keys) => {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (!normalized) continue;
    if (index.has(normalized)) return index.get(normalized);
  }
  return null;
};

const buildConstraintLine = (row, decision) => {
  const reasons = [
    ...toArray(row?.do_not_shoot_reasons),
    ...toArray(row?.missing_signals),
    ...toArray(row?.reason_codes),
  ]
    .map(normalizeReason)
    .filter(Boolean);

  if (reasons.length > 0) {
    const prefix = decision === "DNS" ? "DNS gate" : "Constraint";
    return `${prefix}: ${reasons.slice(0, 3).join(", ")}.`;
  }

  if (decision === "Fund") {
    return "Keep first-2-second proof order, one CTA max, and hold spend expansion until quality gates remain stable.";
  }
  if (decision === "DNS") {
    return "Blocked due to weak quality transfer and elevated decay risk; re-cut structure before retrying.";
  }
  return "Hold for additional validated evidence before expanding budget.";
};

const buildReceiptLine = ({ shootRow, topPostRow, proofRow }) => {
  const views = toNumber(topPostRow?.views, null);
  const delta = toNumber(shootRow?.latest_delta_total ?? proofRow?.latest_delta_total, null);
  const trajectory = String(proofRow?.trajectory || shootRow?.latest_trajectory || "unknown");
  const signal = toNumber(shootRow?.signal_strength_score ?? shootRow?.shootability_score ?? proofRow?.score_total, null);
  const pieces = [];

  if (views !== null) pieces.push(`${Math.round(views).toLocaleString()} views`);
  if (signal !== null) pieces.push(`signal ${signal.toFixed(2)}`);
  if (delta !== null) pieces.push(`delta ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`);
  if (trajectory) pieces.push(`trajectory ${trajectory}`);

  return pieces.length > 0 ? pieces.join(" | ") : "No live receipt metrics available for this scope window.";
};

const buildProofTiles = ({ bundle, market, mode, limit }) => {
  const shootRows = toArray(bundle?.analysis?.cluster_shootability_rows);
  const topPostRows = toArray(bundle?.analysis?.cluster_top_post_rows);
  const proofRows = toArray(bundle?.snapshot?.scope?.proof_tiles_rows_json);

  const proofIndex = buildIndex(proofRows);
  const topPostIndex = buildIndex(topPostRows);
  const seenTitles = new Set();
  const tiles = [];

  const sourceRows = shootRows.length > 0 ? shootRows : proofRows;
  for (const row of sourceRows) {
    const keys = [row.cluster_id, row.cluster_key, row.cluster_label];
    const proofRow = firstRowByKeys(proofIndex, keys) || row;
    const topPostRow = firstRowByKeys(topPostIndex, keys);

    const decision = toDecision(row.signal_verdict || row.shootability_band, Boolean(row.do_not_shoot));
    const title = compactLabel(row.cluster_label || row.cluster_key || proofRow.cluster_label || proofRow.cluster_key);
    if (!title || seenTitles.has(title)) continue;
    seenTitles.add(title);

    const confidenceSource =
      toNumber(row.signal_strength_score, null) ??
      toNumber(row.shootability_score, null) ??
      toNumber(proofRow.score_total, null) ??
      50;
    const confidence = clamp(Math.round(confidenceSource <= 1 ? confidenceSource * 100 : confidenceSource), 5, 98);

    tiles.push({
      decision,
      title,
      receipt: buildReceiptLine({ shootRow: row, topPostRow, proofRow }),
      confidence,
      tags: tagsFromLabel(title, market, mode, proofRow.trajectory),
      constraint: buildConstraintLine(row, decision),
    });

    if (tiles.length >= limit) break;
  }

  return tiles;
};

const buildSummaryMetrics = ({ bundle, proofTiles }) => {
  const shootRows = toArray(bundle?.analysis?.cluster_shootability_rows);
  const externalRows = toArray(bundle?.external_enrichment?.rows);
  const fundCount = proofTiles.filter((tile) => tile.decision === "Fund").length;
  const dnsCount = proofTiles.filter((tile) => tile.decision === "DNS").length;
  const avgConfidence =
    proofTiles.length > 0
      ? Math.round(proofTiles.reduce((acc, row) => acc + toNumber(row.confidence, 0), 0) / proofTiles.length)
      : null;

  return [
    { value: String(proofTiles.length), label: "receipt rows (de-identified)" },
    { value: String(shootRows.length), label: "clusters scored in scope" },
    { value: String(fundCount), label: "fund candidates" },
    { value: String(dnsCount), label: "dns blocked" },
    { value: avgConfidence === null ? "n/a" : `${avgConfidence}%`, label: "avg confidence" },
    { value: String(externalRows.length), label: "external reception rows mapped" },
  ];
};

const buildAppendix = ({ bundle, proofTiles }) => {
  const shootRows = toArray(bundle?.analysis?.cluster_shootability_rows);
  const proofRows = toArray(bundle?.snapshot?.scope?.proof_tiles_rows_json);
  const externalSummary = bundle?.external_enrichment?.summary || {};
  const externalAvailable = Boolean(bundle?.external_enrichment?.available);

  const deltas = shootRows
    .map((row) => toNumber(row.latest_delta_total, null))
    .filter((value) => value !== null);
  const accelCount = deltas.filter((value) => value >= 0.9).length;
  const avgDelta = deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;

  const velocities = shootRows
    .map((row) => toNumber(row.velocity_valid_rate_24h, null))
    .filter((value) => value !== null);
  const avgVelocity = velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : null;

  const trajectories = proofRows.map((row) => String(row.trajectory || "unknown").toLowerCase());
  const declining = trajectories.filter((value) => value.includes("declin")).length;
  const stabilizing = trajectories.filter((value) => value.includes("stabil")).length;

  const avgReception = toNumber(externalSummary.avg_reception_score, null);
  const avgSentiment = toNumber(externalSummary.avg_sentiment_score, null);
  const externalRows = toNumber(externalSummary.total_rows, 0) || 0;

  return [
    {
      key: "momentum",
      title: "Momentum",
      status: "Live",
      headline:
        avgDelta === null
          ? "No live delta rows available for this scope."
          : `${accelCount}/${deltas.length} clusters above +0.9 delta | avg delta ${avgDelta.toFixed(2)}.`,
      gates: [
        `Velocity-valid baseline: ${avgVelocity === null ? "n/a" : `${(avgVelocity * 100).toFixed(2)}%`} across scored clusters.`,
        "Promote only when acceleration and quality gates remain positive across consecutive snapshots.",
      ],
    },
    {
      key: "decay",
      title: "Decay",
      status: "Live",
      headline: `Trajectory mix: ${declining} declining, ${stabilizing} stabilizing, ${proofRows.length - declining - stabilizing} other.`,
      gates: [
        "If trajectory cools, shift from scale to hold and refresh first-frame structure before next budget step.",
        "Caption fatigue and repeated opening beats are decay triggers even when raw views stay high.",
      ],
    },
    {
      key: "reception",
      title: "Reception",
      status: externalAvailable ? "External import" : "Risk gate",
      headline: externalAvailable && externalRows > 0
        ? `External reception rows: ${externalRows}. Avg reception ${avgReception === null ? "n/a" : avgReception.toFixed(3)} | avg sentiment ${avgSentiment === null ? "n/a" : avgSentiment.toFixed(3)}.`
        : "Reception is monitored as a risk gate; if objections cluster, allocation shifts to Hold until re-cut.",
      gates: [
        "Public page is redacted: no handles, direct URLs, or internal IDs in receipt output.",
        "Reception informs risk handling and escalation, not synthetic headline-score inflation.",
      ],
    },
  ];
};

const fetchBundle = async ({ market, mode, limit }) => {
  const supabaseUrl = process.env.SETTA_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SETTA_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase configuration for receipts endpoint.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/export_control_room_bundle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        p_market: market,
        p_mode: mode,
        p_live_window_days: 3,
        p_history_window_days: 90,
        p_limit: clamp(limit * 2, 25, 200),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase RPC failed (${response.status}): ${body.slice(0, 200)}`);
    }

    const payload = await response.json();
    const row = Array.isArray(payload) ? payload[0] : payload;
    if (!row || typeof row !== "object") throw new Error("Invalid bundle payload.");
    return row;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = async (req, res) => {
  const market = String(req.query.market || DEFAULT_MARKET).toUpperCase();
  const mode = String(req.query.mode || DEFAULT_MODE).toLowerCase();
  const limit = clamp(toNumber(req.query.limit, DEFAULT_LIMIT) || DEFAULT_LIMIT, 6, 40);

  try {
    const row = await fetchBundle({ market, mode, limit });
    const bundle = row.bundle_json || {};
    const proofTiles = buildProofTiles({ bundle, market, mode, limit });
    const summaryMetrics = buildSummaryMetrics({ bundle, proofTiles });
    const appendix = buildAppendix({ bundle, proofTiles });

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.status(200).json({
      meta: {
        source: "db:export_control_room_bundle",
        market,
        mode,
        asOf: row.as_of_ts || bundle?.snapshot?.as_of_ts || null,
        privacy: "Public receipts are de-identified and exclude handles, URLs, and internal IDs.",
      },
      summaryMetrics,
      proofTiles,
      appendix,
    });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({
      meta: {
        source: "fallback",
        market,
        mode,
        asOf: null,
        privacy: "Public receipts remain de-identified.",
        warning: "DB receipts unavailable; frontend fallback dataset in use.",
      },
      summaryMetrics: [],
      proofTiles: [],
      appendix: [],
      error: String(error?.message || error),
    });
  }
};
