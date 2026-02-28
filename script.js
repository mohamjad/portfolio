document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("intakeForm");
  const status = document.getElementById("formStatus");
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const trustedRotate = document.getElementById("trustedRotate");
  const trustedTrack = document.getElementById("trustedTrack");
  const proofGrid = document.getElementById("proofGrid");

  const trustedWords = ["agencies", "brands", "creator teams", "performance teams"];

  const trustedLogos = [
    { name: "Partner 01", src: "assets/logos-white/1.png" },
    { name: "Partner 02", src: "assets/logos-white/2.png" },
    { name: "Partner 03", src: "assets/logos-white/3.png" },
    { name: "Partner 04", src: "assets/logos-white/4.png" },
    { name: "Partner 05", src: "assets/logos-white/5.png" },
    { name: "Partner 06", src: "assets/logos-white/6.png" },
    { name: "Partner 07", src: "assets/logos-white/7.png" },
    { name: "Partner 08", src: "assets/logos-white/8.png" },
    { name: "Partner 09", src: "assets/logos-white/9.png" },
  ];

  const proofRows = [
    {
      scope: "US / Exploit",
      title: "Short-form problem-solution hook",
      note: "Velocity validated across three creators with stable retention and manageable saturation risk.",
      window: "72h",
    },
    {
      scope: "US / Discovery",
      title: "Demo-first claim sequence",
      note: "Gate quality outran control cohort and produced cleaner purchase-intent signals.",
      window: "24h",
    },
    {
      scope: "US / Recapture",
      title: "Repeat winner reframing",
      note: "Legacy winner downgraded to context-watch due to saturation drift in live window.",
      window: "72h",
    },
    {
      scope: "US / Discovery",
      title: "Authority plus social-proof opener",
      note: "Cross-market transfer detected with strong engagement quality and compliance fit.",
      window: "48h",
    },
    {
      scope: "US / Exploit",
      title: "UGC narrative pivot",
      note: "Acceleration crossed threshold after recapture refresh and confidence was upgraded.",
      window: "48h",
    },
    {
      scope: "US / Exploit",
      title: "Saturation boundary check",
      note: "Older winner flagged before spend expansion, preventing low-probability re-shoots.",
      window: "72h",
    },
  ];

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

  if (trustedRotate) {
    let wordIndex = 0;
    window.setInterval(() => {
      wordIndex = (wordIndex + 1) % trustedWords.length;
      trustedRotate.style.opacity = "0.25";
      window.setTimeout(() => {
        trustedRotate.textContent = trustedWords[wordIndex];
        trustedRotate.style.opacity = "1";
      }, 130);
    }, 2200);
  }

  if (trustedTrack) {
    const list = [...trustedLogos, ...trustedLogos];
    trustedTrack.innerHTML = list
      .map(
        (logo) => `
        <span class="trusted-item">
          <img src="${logo.src}" alt="${logo.name} logo" loading="eager" decoding="async" />
          <span class="logo-fallback">${logo.name}</span>
        </span>
      `
      )
      .join("");

    trustedTrack.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const item = img.closest(".trusted-item");
        if (item) item.classList.add("no-image");
      });
    });
  }

  if (proofGrid) {
    proofGrid.innerHTML = proofRows
      .map(
        (row) => `
        <article class="proof-card">
          <p class="proof-meta">${row.scope} | ${row.window}</p>
          <h3>${row.title}</h3>
          <p>${row.note}</p>
        </article>
      `
      )
      .join("");
  }

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
        console.error("Failed to load animation", animation.id, error);
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

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const payload = {
      product: String(data.get("product") || ""),
      objective: String(data.get("objective") || ""),
      spendBand: String(data.get("spend_band") || ""),
      timeline: String(data.get("timeline") || ""),
      path: String(data.get("engagement_preference") || ""),
      callNotes: String(data.get("call_notes") || ""),
      constraints: String(data.get("constraints") || ""),
      contactEmail: String(data.get("contact_email") || ""),
    };

    const subject = `Allocation Memo Intake | ${payload.product || "New Request"}`;
    const body = [
      "Setta Allocation Memo Intake",
      "",
      `Product + claim: ${payload.product || "n/a"}`,
      `Objective: ${payload.objective || "n/a"}`,
      `Spend band: ${payload.spendBand || "n/a"}`,
      `Timeline: ${payload.timeline || "n/a"}`,
      `Preferred path: ${payload.path || "async_only"}`,
      `Call notes: ${payload.callNotes || "n/a"}`,
      `Constraints: ${payload.constraints || "n/a"}`,
      `Contact email: ${payload.contactEmail || "n/a"}`,
    ].join("\n");

    window.location.href = `mailto:mohammed@setta.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (status) {
      status.textContent = "Draft opened to mohammed@setta.ca. Send it to complete intake.";
    }
  });
});

