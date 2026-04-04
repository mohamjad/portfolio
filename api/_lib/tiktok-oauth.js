const crypto = require("node:crypto");
const {
  accessSecretVersion,
  readRequiredEnv,
  upsertSecretJson
} = require("./gcp-secret-manager.js");

const TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const STATE_TTL_SECONDS = 15 * 60;

const MODE_CONFIG = {
  sandbox: {
    callbackPath: "/tiktok/sandbox/callback",
    clientKeySecretName: "ai-os-staging-tiktok-sandbox-client-key",
    clientSecretSecretName: "ai-os-staging-tiktok-sandbox-client-secret",
    accountSecretName: "ai-os-staging-tiktok-account-mohammed-sandbox"
  },
  main: {
    callbackPath: "/tiktok/callback",
    clientKeySecretName: "ai-os-staging-tiktok-client-key",
    clientSecretSecretName: "ai-os-staging-tiktok-client-secret",
    accountSecretName: "ai-os-staging-tiktok-account-mohammed-main"
  }
};

function readForwardedValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" ? value : "";
}

function resolveMode(value) {
  return value === "main" ? "main" : "sandbox";
}

function getModeConfig(mode) {
  const normalizedMode = resolveMode(mode);
  const config = MODE_CONFIG[normalizedMode];

  return {
    mode: normalizedMode,
    callbackPath: config.callbackPath,
    clientKeySecretName:
      process.env[normalizedMode === "sandbox" ? "TIKTOK_SANDBOX_CLIENT_KEY_SECRET_NAME" : "TIKTOK_MAIN_CLIENT_KEY_SECRET_NAME"] ||
      config.clientKeySecretName,
    clientSecretSecretName:
      process.env[normalizedMode === "sandbox" ? "TIKTOK_SANDBOX_CLIENT_SECRET_SECRET_NAME" : "TIKTOK_MAIN_CLIENT_SECRET_SECRET_NAME"] ||
      config.clientSecretSecretName,
    accountSecretName:
      process.env[normalizedMode === "sandbox" ? "TIKTOK_SANDBOX_ACCOUNT_SECRET_NAME" : "TIKTOK_MAIN_ACCOUNT_SECRET_NAME"] ||
      config.accountSecretName
  };
}

function resolvePublicBaseUrl(req) {
  const configured = process.env.SETTA_PUBLIC_BASE_URL;
  if (configured && configured.trim()) {
    return configured.trim().replace(/\/+$/g, "");
  }

  const protocol = readForwardedValue(req.headers["x-forwarded-proto"]) || "https";
  const host = readForwardedValue(req.headers["x-forwarded-host"]) || readForwardedValue(req.headers.host);

  if (!host) {
    throw new Error("Unable to resolve public host for TikTok OAuth.");
  }

  return `${protocol}://${host}`;
}

function signStatePayload(payload) {
  const secret = readRequiredEnv("TIKTOK_OAUTH_STATE_SECRET");
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createStateToken(mode, req, next = "/") {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      mode,
      iat: issuedAt,
      exp: issuedAt + STATE_TTL_SECONDS,
      next,
      host: resolvePublicBaseUrl(req)
    }),
    "utf8"
  ).toString("base64url");

  return `${payload}.${signStatePayload(payload)}`;
}

function verifyStateToken(state) {
  if (!state || typeof state !== "string" || !state.includes(".")) {
    throw new Error("Missing or invalid OAuth state.");
  }

  const [payload, signature] = state.split(".", 2);
  const expected = signStatePayload(payload);

  if (!signature || signature.length !== expected.length) {
    throw new Error("OAuth state signature is invalid.");
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("OAuth state signature is invalid.");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);

  if (!decoded.exp || Number(decoded.exp) < now) {
    throw new Error("OAuth state has expired.");
  }

  return decoded;
}

function buildCallbackUrl(req, mode) {
  const config = getModeConfig(mode);
  return `${resolvePublicBaseUrl(req)}${config.callbackPath}`;
}

async function getTikTokModeSecrets(mode, req) {
  const config = getModeConfig(mode);
  const [clientKey, clientSecret] = await Promise.all([
    accessSecretVersion(config.clientKeySecretName, undefined, req),
    accessSecretVersion(config.clientSecretSecretName, undefined, req)
  ]);

  if (!clientKey || !clientSecret) {
    throw new Error(`TikTok client credentials are missing for mode '${config.mode}'.`);
  }

  return {
    ...config,
    clientKey: clientKey.trim(),
    clientSecret: clientSecret.trim()
  };
}

async function buildAuthorizeUrl(req, mode, next) {
  const secrets = await getTikTokModeSecrets(mode, req);
  const callbackUrl = buildCallbackUrl(req, secrets.mode);
  const state = createStateToken(secrets.mode, req, next);
  const authorizeUrl = new URL(TIKTOK_AUTHORIZE_URL);

  authorizeUrl.searchParams.set("client_key", secrets.clientKey);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "video.publish");
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("state", state);

  return {
    authorizeUrl: authorizeUrl.toString(),
    callbackUrl,
    mode: secrets.mode
  };
}

async function exchangeCodeForTokens(req, code, statePayload) {
  const secrets = await getTikTokModeSecrets(statePayload.mode, req);
  const callbackUrl = buildCallbackUrl(req, statePayload.mode);
  const body = new URLSearchParams({
    client_key: secrets.clientKey,
    client_secret: secrets.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl
  });
  const response = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error) {
    const message =
      payload.error_description ||
      payload.message ||
      payload.error ||
      `TikTok token exchange failed with status ${response.status}.`;
    throw new Error(message);
  }

  return {
    secrets,
    tokenPayload: payload
  };
}

async function persistTikTokAccountSecret(input) {
  const {
    mode,
    accountSecretName,
    clientKeySecretName,
    clientSecretSecretName,
    tokenPayload
  } = input;
  const secretPayload = {
    platform: "tiktok",
    mode,
    businessId: process.env.TIKTOK_DEFAULT_BUSINESS_ID || "biz_mohammed",
    accountId: process.env.TIKTOK_DEFAULT_ACCOUNT_ID || "acct_mohammed_tiktok",
    handle: process.env.TIKTOK_DEFAULT_ACCOUNT_HANDLE || "@mohamjadworld",
    clientKeySecretName,
    clientSecretSecretName,
    accessToken: tokenPayload.access_token || null,
    refreshToken: tokenPayload.refresh_token || null,
    openId: tokenPayload.open_id || null,
    scope: tokenPayload.scope || "video.publish",
    tokenType: tokenPayload.token_type || null,
    expiresIn: tokenPayload.expires_in || null,
    refreshExpiresIn: tokenPayload.refresh_expires_in || null,
    authorizedAt: new Date().toISOString(),
    source: "setta-tiktok-oauth-callback",
    raw: tokenPayload
  };

  await upsertSecretJson(accountSecretName, secretPayload, undefined, input.req);
  return secretPayload;
}

function renderHtmlPage({ title, body, accent = "#d38b5d" }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --bg: #f4efe7;
        --ink: #17120d;
        --muted: #5e564c;
        --card: #fffaf3;
        --accent: ${accent};
        --border: rgba(23, 18, 13, 0.12);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(circle at top left, rgba(211, 139, 93, 0.18), transparent 38%),
          linear-gradient(180deg, #f8f1e7 0%, var(--bg) 100%);
        color: var(--ink);
        font: 16px/1.5 Georgia, "Times New Roman", serif;
      }
      main {
        width: min(100%, 720px);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 18px 60px rgba(23, 18, 13, 0.08);
      }
      h1 {
        margin: 0 0 12px;
        font-size: clamp(30px, 5vw, 48px);
        line-height: 1;
      }
      p {
        margin: 0 0 12px;
        color: var(--muted);
      }
      code {
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(23, 18, 13, 0.06);
        color: var(--ink);
      }
      a {
        color: var(--ink);
      }
    </style>
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

module.exports = {
  buildAuthorizeUrl,
  buildCallbackUrl,
  escapeHtml,
  exchangeCodeForTokens,
  getModeConfig,
  persistTikTokAccountSecret,
  renderHtmlPage,
  resolveMode,
  verifyStateToken
};
