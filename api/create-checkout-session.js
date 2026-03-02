const STRIPE_API_BASE = "https://api.stripe.com/v1";

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  const product = String(body?.product || "").trim();

  if (product !== "allocation_memo") {
    res.status(400).json({ error: "Invalid product" });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID_ALLOCATION_MEMO_500;
  const successUrl = process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = process.env.STRIPE_CANCEL_URL;

  if (!secretKey || !priceId || !successUrl || !cancelUrl) {
    res.status(500).json({ error: "Stripe checkout is not configured." });
    return;
  }

  try {
    const payload = new URLSearchParams();
    payload.set("mode", "payment");
    payload.set("success_url", successUrl);
    payload.set("cancel_url", cancelUrl);
    payload.set("line_items[0][price]", priceId);
    payload.set("line_items[0][quantity]", "1");
    payload.set("allow_promotion_codes", "true");

    const stripeResponse = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    const stripeBody = await stripeResponse.json().catch(() => ({}));

    if (!stripeResponse.ok) {
      const stripeError = stripeBody?.error?.message || "Unable to create checkout session.";
      res.status(stripeResponse.status).json({ error: stripeError });
      return;
    }

    if (!stripeBody?.url) {
      res.status(500).json({ error: "Stripe did not return a checkout URL." });
      return;
    }

    res.status(200).json({ url: stripeBody.url });
  } catch (error) {
    res.status(500).json({ error: "Checkout request failed." });
  }
};
