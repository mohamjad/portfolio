const {
  escapeHtml,
  exchangeCodeForTokens,
  persistTikTokAccountSecret,
  renderHtmlPage,
  verifyStateToken
} = require("../_lib/tiktok-oauth.js");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const errorCode = req.query?.error;
    if (typeof errorCode === "string" && errorCode.length > 0) {
      const description = typeof req.query?.error_description === "string" ? req.query.error_description : "TikTok authorization was rejected.";
      res.setHeader("Cache-Control", "no-store");
      res
        .status(400)
        .send(
          renderHtmlPage({
            title: "TikTok Authorization Rejected",
            accent: "#9d4a3a",
            body: `
              <h1>TikTok authorization failed</h1>
              <p><code>${escapeHtml(errorCode)}</code></p>
              <p>${escapeHtml(description)}</p>
            `
          })
        );
      return;
    }

    const statePayload = verifyStateToken(req.query?.state);
    const code = typeof req.query?.code === "string" ? req.query.code.trim() : "";

    if (!code) {
      throw new Error("Missing TikTok OAuth code.");
    }

    const { secrets, tokenPayload } = await exchangeCodeForTokens(req, code, statePayload);
    const storedPayload = await persistTikTokAccountSecret({
      mode: secrets.mode,
      accountSecretName: secrets.accountSecretName,
      clientKeySecretName: secrets.clientKeySecretName,
      clientSecretSecretName: secrets.clientSecretSecretName,
      tokenPayload,
      req
    });

    if (req.query?.format === "json") {
      res.status(200).json({
        ok: true,
        mode: secrets.mode,
        accountSecretName: secrets.accountSecretName,
        openId: storedPayload.openId
      });
      return;
    }

    res.setHeader("Cache-Control", "no-store");
    res
      .status(200)
      .send(
        renderHtmlPage({
          title: "TikTok Connected",
          body: `
            <h1>TikTok connected</h1>
            <p>Setta stored the authorized TikTok account token bundle in GCP Secret Manager.</p>
            <p>Mode: <code>${secrets.mode}</code></p>
            <p>Secret: <code>${secrets.accountSecretName}</code></p>
            <p>Open ID: <code>${storedPayload.openId || "not returned"}</code></p>
            <p>You can close this tab and continue in the operator workflow.</p>
          `
        })
      );
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res
      .status(500)
      .send(
        renderHtmlPage({
          title: "TikTok Callback Error",
          accent: "#9d4a3a",
          body: `
            <h1>TikTok callback failed</h1>
            <p>${escapeHtml(String(error?.message || error))}</p>
            <p>Check the TikTok app callback URL, mode selection, and Setta Vercel environment variables.</p>
          `
        })
      );
  }
};
