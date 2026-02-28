document.addEventListener("DOMContentLoaded", () => {
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const proofGrid = document.getElementById("proofGrid");
  const enemyGrid = document.getElementById("enemyGrid");
  const dynamicBlocks = document.getElementById("dynamicBlocks");
  const intakeForm = document.getElementById("intakeForm");
  const formStatus = document.getElementById("formStatus");

  const proofTiles = [
    {
      decision: "Fund",
      receipt: "velocity up, decay low, reception clean",
      constraint: "proof appears within first 3 seconds",
    },
    {
      decision: "Hold",
      receipt: "velocity stable, decay medium, reception mixed",
      constraint: "run one recapture cycle before spend",
    },
    {
      decision: "DNS",
      receipt: "velocity flat, decay high, reception weak",
      constraint: "replace with problem-solution structure",
    },
    {
      decision: "Fund",
      receipt: "velocity up, decay low, reception clean",
      constraint: "preserve hook-to-proof ordering",
    },
    {
      decision: "Hold",
      receipt: "velocity rising, decay medium, reception uncertain",
      constraint: "verify transfer before allocation",
    },
    {
      decision: "DNS",
      receipt: "velocity down, decay high, reception unstable",
      constraint: "shift to alternate brief variant",
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

  if (proofGrid) {
    proofGrid.innerHTML = proofTiles
      .map(
        (tile) => `
          <article class="proof-card">
            <h3 class="decision">${tile.decision}</h3>
            <p class="receipt">${tile.receipt}</p>
            <p class="constraint">${tile.constraint}</p>
          </article>
        `
      )
      .join("");
  }

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

  revealOnView(enemyGrid, "is-live", 0.2);
  revealOnView(dynamicBlocks, "is-live", 0.14);

  const interactiveBlocks = document.querySelectorAll(".enemy-card-dynamic, .dyn-block");
  interactiveBlocks.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
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
