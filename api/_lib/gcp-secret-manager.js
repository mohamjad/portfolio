const GOOGLE_STS_TOKEN_URL = "https://sts.googleapis.com/v1/token";
const GOOGLE_SERVICE_ACCOUNT_IMPERSONATION_BASE_URL = "https://iamcredentials.googleapis.com/v1";
const SECRET_MANAGER_BASE_URL = "https://secretmanager.googleapis.com/v1";
const ACCESS_TOKEN_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

let cachedAccessToken = null;

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable '${name}'.`);
  }

  return String(value).trim();
}

function readOidcTokenFromRequest(req) {
  const header = req.headers["x-vercel-oidc-token"];
  const token = Array.isArray(header) ? header[0] : header;

  if (!token || !String(token).trim()) {
    throw new Error("Missing x-vercel-oidc-token header. Ensure Vercel OIDC is enabled for the project.");
  }

  return String(token).trim();
}

function readAudience() {
  const value = readRequiredEnv("GCP_WORKLOAD_IDENTITY_AUDIENCE");

  if (value.startsWith("//iam.googleapis.com/")) {
    return value;
  }

  if (value.startsWith("projects/")) {
    return `//iam.googleapis.com/${value}`;
  }

  if (value.startsWith("iam.googleapis.com/projects/")) {
    return `//${value}`;
  }

  throw new Error(
    "Invalid GCP_WORKLOAD_IDENTITY_AUDIENCE format. Use the full provider resource name, for example //iam.googleapis.com/projects/1037265499405/locations/global/workloadIdentityPools/vercel-oidc/providers/vercel-portfolio1."
  );
}

function readServiceAccountEmail() {
  return readRequiredEnv("GCP_SERVICE_ACCOUNT_EMAIL");
}

async function exchangeOidcForFederatedToken(subjectToken) {
  const body = {
    audience: readAudience(),
    grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
    requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
    scope: ACCESS_TOKEN_SCOPE,
    subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
    subjectToken
  };
  const response = await fetch(GOOGLE_STS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token) {
    throw new Error(`Failed to exchange Vercel OIDC token: ${payload.error_description || payload.error || response.status}`);
  }

  return payload.access_token;
}

async function impersonateServiceAccount(federatedAccessToken) {
  const serviceAccountEmail = readServiceAccountEmail();
  const response = await fetch(
    `${GOOGLE_SERVICE_ACCOUNT_IMPERSONATION_BASE_URL}/projects/-/serviceAccounts/${encodeURIComponent(serviceAccountEmail)}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${federatedAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        scope: [ACCESS_TOKEN_SCOPE]
      })
    }
  );
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.accessToken) {
    throw new Error(
      `Failed to impersonate service account '${serviceAccountEmail}': ${payload.error?.message || response.status}`
    );
  }

  return {
    accessToken: payload.accessToken,
    expiresAt: Date.parse(payload.expireTime || "") || Date.now() + 3600 * 1000
  };
}

async function getGoogleAccessToken(req) {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.value;
  }

  const oidcToken = readOidcTokenFromRequest(req);
  const federatedAccessToken = await exchangeOidcForFederatedToken(oidcToken);
  const impersonated = await impersonateServiceAccount(federatedAccessToken);

  cachedAccessToken = {
    value: impersonated.accessToken,
    expiresAt: impersonated.expiresAt
  };

  return cachedAccessToken.value;
}

async function requestSecretManager(path, options = {}) {
  const { req, headers, ...requestInit } = options;
  const token = await getGoogleAccessToken(req);
  const response = await fetch(`${SECRET_MANAGER_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(headers || {})
    }
  });

  if (response.status === 404) {
    return {
      ok: false,
      status: 404,
      payload: null
    };
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || response.statusText || "Secret Manager request failed.";
    throw new Error(message);
  }

  return {
    ok: true,
    status: response.status,
    payload
  };
}

async function accessSecretVersion(secretName, projectId = readRequiredEnv("GCP_PROJECT_ID"), req) {
  const result = await requestSecretManager(
    `/projects/${encodeURIComponent(projectId)}/secrets/${encodeURIComponent(secretName)}/versions/latest:access`,
    {
      method: "GET",
      req,
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (!result.ok) {
    return null;
  }

  const encoded = result.payload?.payload?.data;
  if (!encoded) {
    throw new Error(`Secret '${secretName}' did not return a payload.`);
  }

  return Buffer.from(encoded, "base64").toString("utf8");
}

async function ensureSecretExists(secretName, projectId = readRequiredEnv("GCP_PROJECT_ID"), req) {
  const existing = await requestSecretManager(
    `/projects/${encodeURIComponent(projectId)}/secrets/${encodeURIComponent(secretName)}`,
    {
      method: "GET",
      req,
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (existing.ok) {
    return;
  }

  await requestSecretManager(
    `/projects/${encodeURIComponent(projectId)}/secrets?secretId=${encodeURIComponent(secretName)}`,
    {
      method: "POST",
      req,
      body: JSON.stringify({
        replication: {
          automatic: {}
        }
      })
    }
  );
}

async function addSecretVersion(secretName, value, projectId = readRequiredEnv("GCP_PROJECT_ID"), req) {
  await ensureSecretExists(secretName, projectId, req);
  const encodedPayload = Buffer.from(String(value), "utf8").toString("base64");

  await requestSecretManager(
    `/projects/${encodeURIComponent(projectId)}/secrets/${encodeURIComponent(secretName)}:addVersion`,
    {
      method: "POST",
      req,
      body: JSON.stringify({
        payload: {
          data: encodedPayload
        }
      })
    }
  );
}

async function upsertSecretString(secretName, value, projectId, req) {
  await addSecretVersion(secretName, value, projectId, req);
}

async function upsertSecretJson(secretName, value, projectId, req) {
  await addSecretVersion(secretName, JSON.stringify(value, null, 2), projectId, req);
}

module.exports = {
  accessSecretVersion,
  readRequiredEnv,
  upsertSecretJson,
  upsertSecretString
};
