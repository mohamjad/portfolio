document.addEventListener("DOMContentLoaded", () => {
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const trustedRotate = document.getElementById("trustedRotate");
  const trustedTrack = document.getElementById("trustedTrack");
  const proofGrid = document.getElementById("proofGrid");
  const intakeForm = document.getElementById("intakeForm");
  const formStatus = document.getElementById("formStatus");

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

  const proofTiles = [
    {
      decision: "Fund now",
      why: "velocity up, decay low, reception clean",
      constraint: "Keep proof segment in first 3 seconds",
    },
    {
      decision: "Hold",
      why: "velocity stable, decay medium, reception mixed",
      constraint: "Recapture one additional cycle before funding",
    },
    {
      decision: "Do not shoot",
      why: "velocity flat, decay high, reception weak",
      constraint: "Replace with problem-solution structure",
    },
    {
      decision: "Fund now",
      why: "velocity up, decay low, reception clean",
      constraint: "Preserve hook-to-proof ordering",
    },
    {
      decision: "Hold",
      why: "velocity rising, decay medium, reception uncertain",
      constraint: "Requires transfer check before allocation",
    },
    {
      decision: "Do not shoot",
      why: "velocity down, decay high, reception unstable",
      constraint: "Shift to alternate brief variant",
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

  const setStatus = (message, type = "") => {
    if (!formStatus) return;
    formStatus.className = "form-status";
    if (type) formStatus.classList.add(type);
    formStatus.textContent = message;
  };

  if (trustedRotate) {
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % trustedWords.length;
      trustedRotate.style.opacity = "0.25";
      window.setTimeout(() => {
        trustedRotate.textContent = trustedWords[index];
        trustedRotate.style.opacity = "1";
      }, 140);
    }, 2200);
  }

  if (trustedTrack) {
    const repeated = [...trustedLogos, ...trustedLogos, ...trustedLogos];
    trustedTrack.innerHTML = repeated
      .map(
        (logo) => `
          <span class="logo-item">
            <img src="${logo.src}" alt="${logo.name} logo" loading="eager" decoding="async" />
            <span class="logo-fallback">${logo.name}</span>
          </span>
        `
      )
      .join("");

    trustedTrack.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const parent = img.closest(".logo-item");
        if (parent) parent.classList.add("no-image");
      });
    });
  }

  if (proofGrid) {
    proofGrid.innerHTML = proofTiles
      .map(
        (tile) => `
          <article class="proof-card">
            <h3 class="decision">Decision: ${tile.decision}</h3>
            <p class="receipt">Why: ${tile.why}</p>
            <p class="constraint">Constraint: ${tile.constraint}</p>
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
        `Spend band: ${payload.get("spend_band") || "n/a"}`,
        `Timeline: ${payload.get("timeline") || "n/a"}`,
        `Service path: ${payload.get("engagement_preference") || "n/a"}`,
        `Constraints: ${payload.get("constraints") || "n/a"}`,
        `Call notes: ${payload.get("call_notes") || "n/a"}`,
        `Contact email: ${payload.get("contact_email") || "n/a"}`,
      ].join("\n");

      window.location.href = `mailto:mohammed@setta.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus("Could not post directly. Opened your email draft instead.", "warn");
      console.error(error);
    }
  });
});
