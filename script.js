document.addEventListener("DOMContentLoaded", () => {
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const proofGrid = document.getElementById("proofGrid");
  const proofSummary = document.getElementById("proofSummary");
  const enemyGrid = document.getElementById("enemyGrid");
  const animatedStats = document.getElementById("animatedStats");
  const intakeForm = document.getElementById("intakeForm");
  const formStatus = document.getElementById("formStatus");

  const numberFormatter = new Intl.NumberFormat("en-US");
  const compactFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

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
      value: 382944,
      label: "POSTS INDEXED",
      height: 240,
      marginTop: 80,
      color: "#4cf59d",
    },
    {
      value: 41611851,
      label: "REACH MODELED",
      height: 240,
      marginTop: 180,
      color: "#62b7ff",
      format: "compact",
    },
    {
      value: 1284,
      label: "FORCED RESHOOTS CUT",
      height: 220,
      marginTop: 140,
      color: "#ffe156",
    },
    {
      value: 27,
      label: "AVG ALLOCATION TIME",
      height: 160,
      marginTop: 160,
      color: "#ef63c4",
      suffix: "m",
    },
    {
      value: 6.9,
      label: "AVG ENGAGEMENT",
      height: 320,
      marginTop: 0,
      color: "#4cf59d",
      decimals: 1,
      suffix: "%",
    },
    {
      value: 45.9,
      label: "RETENTION PROXY",
      height: 320,
      marginTop: 100,
      color: "#ef63c4",
      decimals: 1,
      suffix: "%",
    },
    {
      value: 24.3,
      label: "RECEPTION COVERAGE",
      height: 220,
      marginTop: 68,
      color: "#62b7ff",
      decimals: 1,
      suffix: "%",
    },
  ];

  const summaryMetrics = [
    { value: "1,284", label: "forced reshoots cut" },
    { value: "41.6M", label: "modeled reach" },
    { value: "27m", label: "avg allocation time" },
    { value: "6.9%", label: "avg engagement" },
    { value: "45.9%", label: "retention proxy" },
    { value: "24.3%", label: "reception coverage" },
  ];

  const proofTiles = [
    {
      decision: "Fund",
      title: "Proof-first skincare mechanic",
      receipt: "2.63M views | signal 20.04",
      constraint: "Keep first proof beat in the first 3s.",
    },
    {
      decision: "Fund",
      title: "Social proof concealer framing",
      receipt: "1.99M views | signal 20.03",
      constraint: "Anchor claim to one concrete visual outcome.",
    },
    {
      decision: "Hold",
      title: "Texture close-up transfer",
      receipt: "370K views | ER 6.9%",
      constraint: "Confirm second market before scaling budget.",
    },
    {
      decision: "Fund",
      title: "Reply-objection mechanic",
      receipt: "403K views | signal 20.02",
      constraint: "Keep objection-response sequence intact.",
    },
    {
      decision: "DNS",
      title: "Pain challenge reaction frame",
      receipt: "Backlash risk elevated",
      constraint: "Replace with value normalization angle.",
    },
    {
      decision: "Hold",
      title: "High-view low-proof cluster",
      receipt: "Velocity mixed | proof depth limited",
      constraint: "Require one additional validated post.",
    },
  ];

  const setStatus = (message, type = "") => {
    if (!formStatus) return;
    formStatus.className = "form-status";
    if (type) formStatus.classList.add(type);
    formStatus.textContent = message;
  };

  const formatValue = (value, decimals = 0, suffix = "", mode = "plain") => {
    if (mode === "compact") {
      return `${compactFormatter.format(value)}${suffix}`;
    }

    if (decimals > 0) {
      return `${Number(value).toFixed(decimals)}${suffix}`;
    }

    return `${numberFormatter.format(Math.round(Number(value)))}${suffix}`;
  };

  const renderStats = () => {
    if (!animatedStats) return;

    animatedStats.innerHTML = statBars
      .map(
        (stat, index) => `
          <div class="stat-bar" style="height:${stat.height}px; margin-top:${stat.marginTop}px; border-radius:8px; --bar-color:${stat.color}; --delay:${index * 70}ms;">
            <div class="stat-inner">
              <h3 class="stat-value" data-value="${stat.value}" data-decimals="${stat.decimals || 0}" data-suffix="${stat.suffix || ""}" data-format="${stat.format || "plain"}">0</h3>
              <p class="stat-label">${stat.label}</p>
            </div>
          </div>
        `
      )
      .join("");

    const runCountAnimation = () => {
      const values = animatedStats.querySelectorAll(".stat-value");
      const bars = animatedStats.querySelectorAll(".stat-bar");

      bars.forEach((bar, index) => {
        window.setTimeout(() => {
          bar.classList.add("is-live");
        }, index * 70);
      });

      values.forEach((element) => {
        const endValue = Number(element.dataset.value || 0);
        const decimals = Number(element.dataset.decimals || 0);
        const suffix = element.dataset.suffix || "";
        const mode = element.dataset.format || "plain";
        const duration = 900;
        const started = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - started) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = endValue * eased;
          element.textContent = formatValue(current, decimals, suffix, mode);

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      });
    };

    if (!("IntersectionObserver" in window)) {
      runCountAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runCountAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(animatedStats);
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

    proofGrid.innerHTML = proofTiles
      .map(
        (tile) => `
          <article class="proof-card">
            <h3 class="decision decision-${tile.decision.toLowerCase()}">${tile.decision}</h3>
            <p class="proof-title">${tile.title}</p>
            <p class="receipt">${tile.receipt}</p>
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

  renderStats();
  renderProofSummary();
  renderProofTiles();
  revealOnView(enemyGrid, "is-live", 0.2);

  const interactiveCards = document.querySelectorAll(".enemy-card-dynamic, .stat-bar");
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
