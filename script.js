document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("intakeForm");
  const status = document.getElementById("formStatus");
  const scrollLinks = document.querySelectorAll("[data-scroll]");
  const trustedRotate = document.getElementById("trustedRotate");
  const trustedTrack = document.getElementById("trustedTrack");

  const trustedWords = ["agencies", "brands", "creator teams", "performance teams"];
  const trustedLogos = [
    { name: "Partner 01", src: "assets/logos/1.png" },
    { name: "Partner 02", src: "assets/logos/2.png" },
    { name: "Partner 03", src: "assets/logos/3.png" },
    { name: "Partner 04", src: "assets/logos/4.png" },
    { name: "Partner 05", src: "assets/logos/5.png" },
    { name: "Partner 06", src: "assets/logos/6.png" },
    { name: "Partner 07", src: "assets/logos/7.png" },
    { name: "Partner 08", src: "assets/logos/8.png" },
    { name: "Partner 09", src: "assets/logos/9.png" },
  ];

  if (trustedRotate) {
    let wordIndex = 0;
    window.setInterval(() => {
      wordIndex = (wordIndex + 1) % trustedWords.length;
      trustedRotate.style.opacity = "0.25";
      window.setTimeout(() => {
        trustedRotate.textContent = trustedWords[wordIndex];
        trustedRotate.style.opacity = "1";
      }, 140);
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
      constraints: String(data.get("constraints") || ""),
      contactEmail: String(data.get("contact_email") || ""),
    };

    const subject = `Allocation Memo Intake | ${payload.product || "New Request"}`;
    const lines = [
      "Setta Allocation Memo Intake",
      "",
      `Product: ${payload.product || "n/a"}`,
      `Objective: ${payload.objective || "n/a"}`,
      `Spend Band: ${payload.spendBand || "not provided"}`,
      `Timeline: ${payload.timeline || "not provided"}`,
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
