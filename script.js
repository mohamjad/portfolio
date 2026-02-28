document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("intakeForm");
  const status = document.getElementById("formStatus");
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const trustedRotate = document.getElementById("trustedRotate");
  const trustedTrack = document.getElementById("trustedTrack");
  const proofFeedTrack = document.getElementById("proofFeedTrack");
  const animatedStats = document.getElementById("animatedStats");

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

  const proofFeedItems = [
    {
      scope: "US / Exploit",
      cluster: "Short-form problem-solution hook",
      note: "Velocity validated across three creators with stable retention and manageable saturation risk.",
      asOf: "72h",
    },
    {
      scope: "US / Discovery",
      cluster: "Demo-first claim sequence",
      note: "Gate quality outran control cohort and produced cleaner purchase-intent signals.",
      asOf: "24h",
    },
    {
      scope: "US / Exploit",
      cluster: "UGC narrative pivot",
      note: "Acceleration crossed threshold after recapture refresh and confidence was upgraded.",
      asOf: "48h",
    },
    {
      scope: "US / Recapture",
      cluster: "Repeat winner reframing",
      note: "Legacy winner downgraded to context-watch due to saturation drift in live window.",
      asOf: "72h",
    },
    {
      scope: "US / Discovery",
      cluster: "Authority plus social-proof opener",
      note: "Cross-market transfer detected with strong engagement quality and compliance fit.",
      asOf: "48h",
    },
  ];

  if (trustedRotate) {
    let wordIndex = 0;
    window.setInterval(() => {
      wordIndex = (wordIndex + 1) % trustedWords.length;
      trustedRotate.style.opacity = "0.2";
      window.setTimeout(() => {
        trustedRotate.textContent = trustedWords[wordIndex];
        trustedRotate.style.opacity = "1";
      }, 130);
    }, 2200);
  }

  if (trustedTrack) {
    const marqueeLogos = [...trustedLogos, ...trustedLogos];
    trustedTrack.innerHTML = marqueeLogos
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

  if (proofFeedTrack) {
    const feedRows = [...proofFeedItems, ...proofFeedItems];
    proofFeedTrack.innerHTML = feedRows
      .map(
        (item) => `
        <article class="proof-feed-item">
          <div class="proof-feed-meta">
            <span>${item.scope}</span>
            <span>${item.asOf}</span>
          </div>
          <h3 class="proof-feed-cluster">${item.cluster}</h3>
          <p class="proof-feed-note">${item.note}</p>
        </article>
      `
      )
      .join("");
  }

  if (animatedStats) {
    const bars = animatedStats.querySelectorAll(".stat-bar");
    bars.forEach((bar, index) => {
      const height = Number(bar.dataset.height || 220);
      bar.style.setProperty("--target-height", `${height}px`);
      bar.style.transitionDelay = `${index * 70}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animatedStats.classList.add("is-visible");
          observer.disconnect();
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(animatedStats);
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
      engagementPreference: String(data.get("engagement_preference") || ""),
      callNotes: String(data.get("call_notes") || ""),
      constraints: String(data.get("constraints") || ""),
      contactEmail: String(data.get("contact_email") || ""),
    };

    const subject = `Allocation Memo Intake | ${payload.product || "New Request"}`;
    const lines = [
      "Setta Allocation Memo Intake",
      "",
      `Product + claim: ${payload.product || "n/a"}`,
      `Objective: ${payload.objective || "n/a"}`,
      `Spend Band: ${payload.spendBand || "not provided"}`,
      `Timeline: ${payload.timeline || "not provided"}`,
      `Preferred Path: ${payload.engagementPreference || "async_only"}`,
      `Call Notes: ${payload.callNotes || "not provided"}`,
      `Constraints: ${payload.constraints || "n/a"}`,
      `Contact Email: ${payload.contactEmail || "n/a"}`,
    ];

    const mailto = `mailto:mohammed@setta.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = mailto;

    if (status) {
      status.textContent = "Draft opened to mohammed@setta.ca. Send it to complete intake.";
    }
  });
});
