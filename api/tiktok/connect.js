const { buildAuthorizeUrl, escapeHtml, renderHtmlPage, resolveMode } = require("../_lib/tiktok-oauth.js");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const mode = resolveMode(req.query?.mode);
    const next = typeof req.query?.next === "string" && req.query.next.startsWith("/")
      ? req.query.next
      : "/";
    const { authorizeUrl, callbackUrl } = await buildAuthorizeUrl(req, mode, next);

    if (req.query?.format === "json") {
      res.status(200).json({
        mode,
        callbackUrl,
        authorizeUrl
      });
      return;
    }

    res.writeHead(302, {
      Location: authorizeUrl,
      "Cache-Control": "no-store"
    });
    res.end();
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res
      .status(500)
      .send(
        renderHtmlPage({
          title: "TikTok Connect Error",
          accent: "#9d4a3a",
          body: `
            <h1>TikTok connect failed</h1>
            <p>${escapeHtml(String(error?.message || error))}</p>
            <p>Check the OAuth env vars and GCP Secret Manager wiring for Setta.</p>
          `
        })
      );
  }
};
