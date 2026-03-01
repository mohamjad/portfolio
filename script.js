document.addEventListener("DOMContentLoaded", () => {
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const proofGrid = document.getElementById("proofGrid");
  const proofSummary = document.getElementById("proofSummary");
  const proofFilters = document.getElementById("proofFilters");
  const enemyGrid = document.getElementById("enemyGrid");
  const statsSection = document.getElementById("stats");
  const animatedStats = document.getElementById("animatedStats");
  const memoArtifact = document.getElementById("memoArtifact");
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

  const statBars = [
    {
      valueLabel: "400K+",
      label: "POSTS INDEXED",
      tooltip:
        "400K+ posts indexed - reception mapped across 124 signals - backtested against live and historical campaign outcomes",
      height: 340,
      offset: -30,
      color: "#17BF14",
      offsetText: true,
    },
    {
      valueLabel: "180+",
      label: "CONCEPTS ALLOCATED",
      height: 340,
      offset: 70,
      color: "#43AFDE",
      offsetText: true,
    },
    {
      valueLabel: "800+",
      label: "DEAD FORMATS BLOCKED",
      height: 300,
      offset: 30,
      color: "#E455BC",
      offsetText: true,
    },
    {
      valueLabel: "520+",
      label: "CREATORS WATCHLISTED",
      height: 420,
      offset: 40,
      color: "#E455BC",
      offsetText: true,
    },
    {
      valueLabel: "56hr",
      label: "AVG TURNAROUND",
      height: 320,
      offset: 20,
      color: "#EA9D09",
      offsetText: true,
    },
    {
      valueLabel: "124",
      label: "QUANT INPUTS / DECISION",
      height: 320,
      offset: -60,
      color: "#43AFDE",
      offsetText: true,
    },
    {
      valueLabel: "100K+",
      label: "INTERNATIONAL SIGNALS",
      tooltip:
        "JP, KR, UK, AU -> US transfer and campaign reception/engagement patterns tracked for early format identification",
      height: 360,
      offset: -20,
      color: "#17BF14",
      offsetText: true,
    },
  ];

  const summaryMetrics = [
    { value: "28,313", label: "posts analyzed (full-intel export)" },
    { value: "11,148", label: "gate-passed posts" },
    { value: "10,111", label: "velocity-valid posts" },
    { value: "2,163", label: "general queue decisions" },
    { value: "1,751", label: "do-not-shoot verdicts" },
    { value: "532", label: "proof tiles generated" },
  ];

  const proofTiles = [
    {
      decision: "DNS",
      title: "replying luckylibra blush blindness (general)",
      receipt: "Public beauty proof row | 8,129 views | strength 50.25 | score 49.40",
      confidence: 78,
      tags: ["makeup", "cosmetics", "saturations"],
      constraint:
        "DNS triggers: low_velocity_valid_rate + weak_score_total. Missing macro score and gate-depth thresholds.",
    },
    {
      decision: "DNS",
      title: "super quick clean makeup (grwm)",
      receipt: "Public beauty proof row | 27,955 views | strength 49.90 | accel 0.0204",
      confidence: 74,
      tags: ["makeup", "trending"],
      constraint:
        "DNS triggers: low_gate_pass_rate + low_velocity_valid_rate + weak_score_total.",
    },
    {
      decision: "DNS",
      title: "53 contour method never (general)",
      receipt: "Public beauty proof row | 331,229 views | strength 47.14 | score 40.87",
      confidence: 71,
      tags: ["makeup", "cosmetics", "saturations"],
      constraint:
        "High view volume still failed decision quality: macro_score_total_lt_62 and micro velocity thresholds.",
    },
    {
      decision: "DNS",
      title: "bebot (general)",
      receipt: "Public beauty proof row | 525,256 views | exploit lane | strength 46.15",
      confidence: 69,
      tags: ["makeup", "cosmetics", "saturations"],
      constraint:
        "DNS triggers: low_gate_pass_rate + low_velocity_valid_rate + weak_score_total; recapture coverage remains below target.",
    },
    {
      decision: "Hold",
      title: "makeup artist best known (general)",
      receipt: "Public beauty proof row | 104,564 views | noise strength 38.31 | readiness 4/12",
      confidence: 63,
      tags: ["makeup", "trending"],
      constraint:
        "Hold until recapture coverage and gate depth clear. Current row is queue-noise, not production-ready.",
    },
    {
      decision: "Hold",
      title: "apply new brightening concealer (tutorial)",
      receipt: "Public beauty proof row | 30,705 views | noise strength 37.27 | readiness 4/12",
      confidence: 61,
      tags: ["makeup", "cosmetics", "trending"],
      constraint:
        "Hold pending stronger core score and one additional validated post before scaling spend.",
    },
    {
      decision: "Fund",
      title: "JP Derived: blush carry-over spike",
      receipt: "JP-derived proof row | signal 51.47 | accelerating +9.94 delta",
      confidence: 84,
      tags: ["jp_derived", "makeup", "trending"],
      constraint:
        "Run as transfer candidate only after US proof-first pacing swap; keep two-variant cap on first allocation.",
    },
    {
      decision: "Fund",
      title: "KR Derived: contour adaptation lane",
      receipt: "KR-derived proof row | signal 41.97 | ER 8.94% | accelerating +2.94",
      confidence: 81,
      tags: ["kr_derived", "makeup", "trending"],
      constraint:
        "Preserve KR sequence logic but lower polish and add immediate proof beat for US paid context.",
    },
    {
      decision: "Hold",
      title: "Saturation Risk: texture pattern cooling",
      receipt: "US tile trajectory stabilizing | delta -1.94 | score 46.06",
      confidence: 66,
      tags: ["makeup", "saturations"],
      constraint:
        "Cut spend 30-50% and rotate to fresh hook before hard decline confirmation.",
    },
    {
      decision: "Hold",
      title: "Saturation Risk: payoff-late tutorials",
      receipt: "US stabilizing lane | repeated late-proof structure",
      confidence: 62,
      tags: ["makeup", "cosmetics", "saturations"],
      constraint:
        "Move proof to first 2s and collapse runtime to 18-25s before re-approval.",
    },
    {
      decision: "Hold",
      title: "outfitrepeater (general)",
      receipt:
        "outfitrepeater cluster | 2,158,020 views | source: proof-pack-US-exploit-2026-02-28T00-19-47-287Z",
      confidence: 72,
      tags: ["apparel_retail_ecommerce", "retail", "trending"],
      constraint:
        "Mapped from live exploit export; historical tile with age/velocity decay risk. Use structure for hook transfer, not direct scale.",
    },
    {
      decision: "Hold",
      title: "coquettefashion (general)",
      receipt:
        "coquettefashion cluster | 1,296,994 views | source: proof-pack-US-exploit-2026-02-28T00-19-47-287Z",
      confidence: 69,
      tags: ["apparel_retail_ecommerce", "apparel", "trending"],
      constraint:
        "Strong view proof but stale lane risk. Re-test with fresh creator and first-2s proof to confirm current relevance.",
    },
    {
      decision: "DNS",
      title: "coquette (general)",
      receipt:
        "coquette cluster | 612,135 views | source: proof-pack-US-exploit-2026-02-28T00-19-47-287Z",
      confidence: 66,
      tags: ["apparel_retail_ecommerce", "apparel", "saturations"],
      constraint:
        "Pattern flagged as historical in current window; treat as saturation-prone unless new momentum clears gate thresholds.",
    },
    {
      decision: "Hold",
      title: "coquette (general)",
      receipt:
        "coquette cluster | 205,080 views | source: proof-pack-US-exploit-2026-02-28T00-19-47-287Z",
      confidence: 64,
      tags: ["apparel_retail_ecommerce", "retail"],
      constraint:
        "Retail-style aesthetic transfer candidate. Keep spend capped until modern recapture proves velocity validity.",
    },
    {
      decision: "Hold",
      title: "burberry (general)",
      receipt:
        "burberry cluster | 75,675 views | source: proof-pack-US-exploit-2026-02-28T00-19-47-287Z",
      confidence: 61,
      tags: ["apparel_retail_ecommerce", "retail"],
      constraint:
        "Brand/retail cue is useful for framing, but live gate depth is insufficient for immediate budget expansion.",
    },
    {
      decision: "DNS",
      title: "jfashion (general)",
      receipt:
        "jfashion cluster | 18,143 views | source: proof-pack-US-exploit-2026-02-28T00-19-47-287Z",
      confidence: 58,
      tags: ["apparel_retail_ecommerce", "apparel", "saturations", "jp_derived"],
      constraint:
        "Cross-market style signal is present, but current US readiness is weak. Hold until fresh transfer proof clears quality gates.",
    },
  ];

  let activeProofFilter = "general";

  const setStatus = (message, type = "") => {
    if (!formStatus) return;
    formStatus.className = "form-status";
    if (type) formStatus.classList.add(type);
    formStatus.textContent = message;
  };

  const renderStats = () => {
    if (!animatedStats || !statsSection) return;

    animatedStats.innerHTML = statBars
      .map(
        (stat) => `
          <div class="stat-bar" ${stat.tooltip ? `title="${stat.tooltip}"` : ""} style="height:0px; margin-top:200px; border-radius:8px; --bar-color:${stat.color};">
            <div class="stat-inner">
              <h3 class="stat-value${stat.compactValue ? " stat-value-compact" : ""}">${stat.valueLabel}</h3>
              <p class="stat-label">${stat.label}</p>
            </div>
          </div>
        `
      )
      .join("");

    const bars = animatedStats.querySelectorAll(".stat-bar");
    const maxHeight = Math.max(...statBars.map((bar) => bar.height));
    const VISIBILITY_PADDING = window.innerWidth <= 834 ? 0 : 300;
    let rafPending = false;

    const applyLayout = () => {
      rafPending = false;
      const offsetTop = statsSection.getBoundingClientRect().top;
      const scrollAmount = window.innerHeight - offsetTop - VISIBILITY_PADDING;
      const startOffset = scrollAmount > maxHeight;

      bars.forEach((barNode, index) => {
        const stat = statBars[index];
        const barHeight =
          startOffset || scrollAmount > stat.height
            ? stat.height
            : Math.max(scrollAmount, 0);

        const offsetAmt =
          stat.offset > 0
            ? Math.min(scrollAmount, stat.offset)
            : Math.max(-scrollAmount, stat.offset);

        const barOffset = startOffset
          ? 200 - Math.floor(barHeight / 2) + offsetAmt
          : 200 - Math.floor(barHeight / 2);

        const valueNode = barNode.querySelector(".stat-value");
        valueNode.style.paddingTop = stat.offsetText
          ? `${Math.floor(stat.height / 4)}px`
          : "0px";

        barNode.style.height = `${Math.max(barHeight, 0)}px`;
        barNode.style.marginTop = `${barOffset}px`;
      });
    };

    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(applyLayout);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  };

  const renderProofSummary = () => {
    if (!proofSummary) return;

    proofSummary.innerHTML = summaryMetrics
      .map(
        (metric) => `
          <article class="proof-metric">
            <strong>${metric.value}</strong>
            <span>${metric.label}</span>
          </article>
        `
      )
      .join("");
  };

  const renderProofTiles = () => {
    if (!proofGrid) return;

    const filteredTiles =
      activeProofFilter === "general"
        ? proofTiles
        : proofTiles.filter((tile) => (tile.tags || []).includes(activeProofFilter));

    if (!filteredTiles.length) {
      proofGrid.innerHTML = `
        <article class="proof-card proof-empty">
          <h3>No rows in this segment</h3>
          <p>Switch segment filters or widen the proof window.</p>
        </article>
      `;
      return;
    }

    proofGrid.innerHTML = filteredTiles
      .map(
        (tile) => `
          <article class="proof-card">
            <h3 class="decision decision-${tile.decision.toLowerCase()}">${tile.decision}</h3>
            <p class="proof-title">${tile.title}</p>
            <p class="receipt">${tile.receipt}</p>
            <p class="proof-tags">${(tile.tags || [])
              .map((tag) => `<span>${tag.replaceAll("_", " ")}</span>`)
              .join("")}</p>
            <div class="confidence-row confidence-row-proof">
              <span>Confidence</span>
              <strong>${tile.confidence}%</strong>
            </div>
            <div class="confidence-bar confidence-bar-proof" aria-label="Confidence ${tile.confidence} percent">
              <span style="--confidence: ${tile.confidence}%"></span>
            </div>
            <p class="constraint">${tile.constraint}</p>
          </article>
        `
      )
      .join("");
  };

  const revealOnView = (element, className = "is-live", threshold = 0.18) => {
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      element.classList.add(className);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.classList.add(className);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
  };

  const initMemoArtifact = () => {
    if (!memoArtifact) return;

    const navItems = memoArtifact.querySelectorAll(".memo-nav-item");
    const panes = memoArtifact.querySelectorAll("[data-memo-pane]");
    const receiptStrip = memoArtifact.querySelector(".memo-receipt-strip");

    const activatePane = (target) => {
      panes.forEach((pane) => {
        pane.classList.toggle("is-active", pane.dataset.memoPane === target);
      });

      navItems.forEach((item) => {
        const isActive = item.dataset.memoTarget === target;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    };

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        activatePane(item.dataset.memoTarget);
      });
    });

    if (receiptStrip) {
      receiptStrip.addEventListener("click", () => {
        activatePane("receipts");
      });
    }
  };

  renderStats();
  renderProofSummary();
  renderProofTiles();
  initMemoArtifact();
  revealOnView(enemyGrid, "is-live", 0.2);

  if (proofFilters) {
    proofFilters.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-proof-filter]");
      if (!btn) return;
      activeProofFilter = btn.dataset.proofFilter || "general";

      proofFilters.querySelectorAll("[data-proof-filter]").forEach((filterBtn) => {
        filterBtn.classList.toggle("is-active", filterBtn === btn);
      });

      renderProofTiles();
    });
  }

  const interactiveCards = document.querySelectorAll(".enemy-card-dynamic");
  interactiveCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

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
