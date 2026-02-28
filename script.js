document.addEventListener("DOMContentLoaded", () => {
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const proofGrid = document.getElementById("proofGrid");
  const proofSummary = document.getElementById("proofSummary");
  const enemyGrid = document.getElementById("enemyGrid");
  const animatedStats = document.getElementById("animatedStats");
  const intakeForm = document.getElementById("intakeForm");
  const formStatus = document.getElementById("formStatus");

  const heroAnimations = [
    { id: "heroAnimExtraSpark", path: "assets/hero/ExtraSpark.json" },
    { id: "heroAnimPinkSpark", path: "assets/hero/PinkSpark.json" },
    { id: "heroAnimYellowSpark", path: "assets/hero/YellowSpark.json" },
    { id: "heroAnimPinkGear", path: "assets/hero/PinkGear.json" },
    { id: "heroAnimGreenGear", path: "assets/hero/GreenGear.json" },
    { id: "heroAnimGreenBlueStar", path: "assets/hero/GreenBlueStar.json" },
    { id: "heroAnimPinkStar", path: "assets/hero/PinkStar.json" },
    { id: "heroAnimGreenYellowStar", path: "assets/hero/GreenYellowStar.json" },
    { id: "heroAnimGreenStar", path: "assets/hero/GreenStar.json" },
    { id: "heroAnimSmallGreenStar", path: "assets/hero/SmallGreenStar.json" },
  ];

  const setStatus = (message, type = "") => {
    if (!formStatus) return;
    formStatus.className = "form-status";
    if (type) formStatus.classList.add(type);
    formStatus.textContent = message;
  };

  const numberFormatter = new Intl.NumberFormat("en-US");

  const formatCount = (value, decimals = 0, suffix = "") => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return `0${suffix}`;
    }

    if (decimals > 0) {
      return `${numeric.toFixed(decimals)}${suffix}`;
    }

    return `${numberFormatter.format(Math.round(numeric))}${suffix}`;
  };

  const compact = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "0";
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(numeric);
  };

  const truncate = (value, max = 84) => {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return "No constraint flagged.";
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1)}�`;
  };

  const normalizeText = (value) =>
    String(value || "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/—/g, "-")
      .replace(/–/g, "-")
      .replace(/’/g, "'")
      .replace(/“|�/g, '"')
      .replace(/\s+/g, " ")
      .trim();

  const loadProofTiles = async () => {
    try {
      const response = await fetch("data/setta_proof_tiles_v2.json", { cache: "no-store" });
      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json) && json.length) {
          return json;
        }
      }
    } catch (error) {
      console.warn("Could not load proof tiles JSON", error);
    }

    if (Array.isArray(window.SETTA_PROOF_TILES_V2) && window.SETTA_PROOF_TILES_V2.length) {
      return window.SETTA_PROOF_TILES_V2;
    }

    return [];
  };

  const computeMetrics = (tiles) => {
    const count = tiles.length;
    const views = tiles
      .map((tile) => Number(tile?.metrics?.views || 0))
      .filter((value) => Number.isFinite(value) && value > 0);

    const erValues = tiles
      .map((tile) => Number(tile?.metrics?.er_percent))
      .filter((value) => Number.isFinite(value) && value > 0);

    const velocityValidatedCount = tiles.filter((tile) => {
      const reason = normalizeText(tile?.why_post_matters).toLowerCase();
      return reason.includes("velocity_validated");
    }).length;

    const receptionTaggedCount = tiles.filter((tile) => {
      const joined = [
        normalizeText(tile?.headline),
        normalizeText(tile?.subhead),
        normalizeText(tile?.why_post_matters),
        Array.isArray(tile?.do_not_shoot_reasons) ? tile.do_not_shoot_reasons.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();

      return /(reception|objection|reply|backlash|social proof|proof)/.test(joined);
    }).length;

    const retentionProxy = count ? (velocityValidatedCount / count) * 100 : 0;
    const avgER = erValues.length
      ? erValues.reduce((sum, value) => sum + value, 0) / erValues.length
      : 0;

    const receptionCoverage = count ? (receptionTaggedCount / count) * 100 : 0;

    return {
      tileCount: count,
      totalViews: views.reduce((sum, value) => sum + value, 0),
      avgER,
      erSamples: erValues.length,
      retentionProxy,
      receptionCoverage,
      velocityValidatedCount,
    };
  };

  const decideTileBand = (tile) => {
    const verdict = normalizeText(tile?.verdict).toLowerCase();
    if (verdict.includes("do_not_shoot") || verdict === "dns") return "DNS";

    const reason = normalizeText(tile?.why_post_matters).toLowerCase();
    if (reason.includes("velocity_validated") || reason.includes("scale_proof")) return "Fund";

    return "Hold";
  };

  const tileReceiptLine = (tile) => {
    const metrics = tile?.metrics || {};
    const parts = [];

    if (Number.isFinite(Number(metrics.views)) && Number(metrics.views) > 0) {
      parts.push(`${compact(metrics.views)} views`);
    }
    if (Number.isFinite(Number(metrics.post_signal_score))) {
      parts.push(`signal ${Number(metrics.post_signal_score).toFixed(2)}`);
    }
    if (Number.isFinite(Number(metrics.er_percent))) {
      parts.push(`ER ${Number(metrics.er_percent).toFixed(1)}%`);
    }

    if (!parts.length) {
      const fallback = normalizeText(tile?.why_post_matters) || "evidence loaded";
      return fallback;
    }

    return parts.join(" | ");
  };

  const tileConstraintLine = (tile) => {
    if (Array.isArray(tile?.do_not_shoot_checks) && tile.do_not_shoot_checks.length) {
      return truncate(tile.do_not_shoot_checks[0]);
    }

    if (Array.isArray(tile?.recommended_tests) && tile.recommended_tests.length) {
      return truncate(tile.recommended_tests[0]);
    }

    return "Keep hook-to-proof sequence fixed.";
  };

  const renderProof = (tiles) => {
    if (!proofGrid) return;

    const sorted = [...tiles].sort((a, b) => {
      const aViews = Number(a?.metrics?.views || 0);
      const bViews = Number(b?.metrics?.views || 0);
      return bViews - aViews;
    });

    const selected = sorted.slice(0, 12);

    proofGrid.innerHTML = selected
      .map((tile) => {
        const decision = decideTileBand(tile);
        const title = normalizeText(tile?.headline || tile?.cluster_label || "Signal tile");
        return `
          <article class="proof-card">
            <h3 class="decision decision-${decision.toLowerCase()}">${decision}</h3>
            <p class="proof-title">${title}</p>
            <p class="receipt">${tileReceiptLine(tile)}</p>
            <p class="constraint">${tileConstraintLine(tile)}</p>
          </article>
        `;
      })
      .join("");
  };

  const renderProofSummary = (metrics) => {
    if (!proofSummary) return;

    proofSummary.innerHTML = `
      <article class="proof-metric">
        <strong>${formatCount(metrics.tileCount)}</strong>
        <span>proof tiles loaded</span>
      </article>
      <article class="proof-metric">
        <strong>${metrics.avgER ? `${metrics.avgER.toFixed(2)}%` : "n/a"}</strong>
        <span>engagement (${formatCount(metrics.erSamples)} ER samples)</span>
      </article>
      <article class="proof-metric">
        <strong>${metrics.retentionProxy.toFixed(1)}%</strong>
        <span>retention proxy (velocity-validated share)</span>
      </article>
      <article class="proof-metric">
        <strong>${metrics.receptionCoverage.toFixed(1)}%</strong>
        <span>reception signal coverage</span>
      </article>
    `;
  };

  const buildStatsData = (metrics) => [
    {
      value: 23859,
      label: "posts indexed",
      decimals: 0,
      suffix: "",
      height: 88,
      color: "#4cf59d",
    },
    {
      value: 322,
      label: "briefs generated",
      decimals: 0,
      suffix: "",
      height: 64,
      color: "#62b7ff",
    },
    {
      value: 75,
      label: "72h exploit positive",
      decimals: 1,
      suffix: "%",
      height: 75,
      color: "#ffe156",
    },
    {
      value: metrics.tileCount,
      label: "proof tiles",
      decimals: 0,
      suffix: "",
      height: Math.min(92, 36 + metrics.tileCount),
      color: "#ef63c4",
    },
    {
      value: metrics.avgER,
      label: "engagement",
      decimals: 2,
      suffix: "%",
      height: Math.min(86, Math.max(34, metrics.avgER * 10)),
      color: "#4cf59d",
    },
    {
      value: metrics.retentionProxy,
      label: "retention proxy",
      decimals: 1,
      suffix: "%",
      height: Math.max(28, metrics.retentionProxy),
      color: "#ffd86a",
    },
    {
      value: metrics.receptionCoverage,
      label: "reception coverage",
      decimals: 1,
      suffix: "%",
      height: Math.max(24, metrics.receptionCoverage),
      color: "#7aa8ff",
    },
  ];

  const renderAnimatedStats = (stats) => {
    if (!animatedStats) return;

    animatedStats.innerHTML = stats
      .map(
        (stat, index) => `
          <article class="stat-bar" style="--target:${Math.round(stat.height)}%; --delay:${index * 80}ms; --bar-color:${stat.color};">
            <div class="stat-fill" aria-hidden="true"></div>
            <p class="stat-value" data-value="${stat.value}" data-decimals="${stat.decimals}" data-suffix="${stat.suffix}">0${stat.suffix}</p>
            <p class="stat-label">${stat.label}</p>
          </article>
        `
      )
      .join("");

    const values = animatedStats.querySelectorAll(".stat-value");
    const bars = animatedStats.querySelectorAll(".stat-bar");

    const animateValue = (element) => {
      const end = Number(element.dataset.value || 0);
      const decimals = Number(element.dataset.decimals || 0);
      const suffix = element.dataset.suffix || "";
      const duration = 1000;
      const startTime = performance.now();

      const frame = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = end * eased;
        element.textContent = formatCount(current, decimals, suffix);

        if (progress < 1) {
          requestAnimationFrame(frame);
        }
      };

      requestAnimationFrame(frame);
    };

    const runAnimation = () => {
      bars.forEach((bar, index) => {
        window.setTimeout(() => {
          bar.classList.add("is-live");
        }, index * 80);
      });

      values.forEach((value) => animateValue(value));
    };

    if (!("IntersectionObserver" in window)) {
      runAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.22 }
    );

    observer.observe(animatedStats);
  };

  const revealOnView = (element, className = "is-live", threshold = 0.18) => {
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      element.classList.add(className);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          element.classList.add(className);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
  };

  const interactiveBlocks = document.querySelectorAll(".enemy-card-dynamic, .stat-bar");
  interactiveBlocks.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 3.2).toFixed(2)}deg) rotateY(${(x * 4.2).toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  revealOnView(enemyGrid, "is-live", 0.2);

  if (window.lottie) {
    heroAnimations.forEach((animation) => {
      const container = document.getElementById(animation.id);
      if (!container) return;

      try {
        window.lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: animation.path,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
            hideOnTransparent: true,
          },
        });
      } catch (error) {
        console.error(`Failed to load animation: ${animation.id}`, error);
      }
    });
  }

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  loadProofTiles().then((tiles) => {
    const metrics = computeMetrics(tiles);
    const stats = buildStatsData(metrics);
    renderAnimatedStats(stats);
    renderProofSummary(metrics);
    renderProof(tiles);
  });

  if (!intakeForm) return;

  intakeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!intakeForm.checkValidity()) {
      intakeForm.reportValidity();
      setStatus("Please fill all required fields.", "warn");
      return;
    }

    const payload = new FormData(intakeForm);
    const endpoint = "https://formsubmit.co/ajax/mohammed@setta.ca";

    setStatus("Submitting intake...", "");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Submit failed (${response.status})`);
      }

      setStatus("Intake sent. You should receive a reply at the contact email provided.", "success");
      intakeForm.reset();
      return;
    } catch (error) {
      const subject = `Setta Intake | ${payload.get("product") || "New Request"}`;
      const body = [
        "Setta Allocation Memo Intake",
        "",
        `Product + claim: ${payload.get("product") || "n/a"}`,
        `Objective: ${payload.get("objective") || "n/a"}`,
        `Timeline: ${payload.get("timeline") || "n/a"}`,
        `Spend band: ${payload.get("spend_band") || "n/a"}`,
        `Constraints: ${payload.get("constraints") || "n/a"}`,
        `Contact email: ${payload.get("contact_email") || "n/a"}`,
        `Call notes: ${payload.get("call_notes") || "n/a"}`,
      ].join("\n");

      window.location.href = `mailto:mohammed@setta.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("Could not post directly. Opened your email draft instead.", "warn");
      console.error(error);
    }
  });
});
