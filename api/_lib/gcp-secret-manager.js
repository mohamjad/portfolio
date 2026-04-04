const SECRET_MANAGER_BASE_URL = "https://secretmanager.googleapis.com/v1";
const ACCESS_TOKEN_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const DEFAULT_GCP_PROJECT_ID = "persona1-staging";
const DEFAULT_GCP_PROJECT_NUMBER = "1037265499405";
const DEFAULT_GCP_SERVICE_ACCOUNT_EMAIL = "setta-tiktok-oauth@persona1-staging.iam.gserviceaccount.com";
const DEFAULT_GCP_WORKLOAD_IDENTITY_POOL_ID = "vercel-oidc";
const DEFAULT_GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = "vercel-portfolio1";

let dependencyPromise = null;

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable '${name}'.`);
  }

  return String(value).trim();
}

function readProjectId() {
  return (process.env.GCP_PROJECT_ID || DEFAULT_GCP_PROJECT_ID).trim();
}

function readProjectNumber() {
  return (process.env.GCP_PROJECT_NUMBER || DEFAULT_GCP_PROJECT_NUMBER).trim();
}

function readServiceAccountEmail() {
  return (process.env.GCP_SERVICE_ACCOUNT_EMAIL || DEFAULT_GCP_SERVICE_ACCOUNT_EMAIL).trim();
}

function readWorkloadIdentityPoolId() {
  return (process.env.GCP_WORKLOAD_IDENTITY_POOL_ID || DEFAULT_GCP_WORKLOAD_IDENTITY_POOL_ID).trim();
}

function readWorkloadIdentityProviderId() {
  return (process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || DEFAULT_GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID).trim();
}

function buildAudience() {
  return `//iam.googleapis.com/projects/${readProjectNumber()}/locations/global/workloadIdentityPools/${readWorkloadIdentityPoolId()}/providers/${readWorkloadIdentityProviderId()}`;
}

function readOidcTokenFromRequest(req) {
  const header = req?.headers?.["x-vercel-oidc-token"];
  const token = Array.isArray(header) ? header[0] : header;

  return token && String(token).trim() ? String(token).trim() : null;
}

async function loadAuthDependencies() {
  if (!dependencyPromise) {
    dependencyPromise = Promise.all([
      import("@vercel/oidc"),
      import("google-auth-library")
    ]).then(([oidcModule, googleAuthModule]) => ({
      getVercelOidcToken: oidcModule.getVercelOidcToken,
      ExternalAccountClient: googleAuthModule.ExternalAccountClient
    }));
  }

  return dependencyPromise;
}

async function getSubjectToken(req) {
  const { getVercelOidcToken } = await loadAuthDependencies();

  try {
    const token = await getVercelOidcToken();
    if (token) {
      return token;
    }
  } catch {
    // Fall back to the runtime-injected header for environments where the helper is unavailable.
  }

  const fallback = readOidcTokenFromRequest(req);
  if (fallback) {
    return fallback;
  }

  throw new Error("Missing Vercel OIDC token. Ensure OIDC is enabled for the project and the function is running on Vercel.");
}

async function getGoogleAuthHeaders(req) {
  const { ExternalAccountClient } = await loadAuthDependencies();
  const authClient = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience: buildAudience(),
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${readServiceAccountEmail()}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: () => getSubjectToken(req)
    }
  });

  return authClient.getRequestHeaders();
}

async function requestSecretManager(path, options = {}) {
  const { req, headers, ...requestInit } = options;
  const authHeaders = await getGoogleAuthHeaders(req);
  const response = await fetch(`${SECRET_MANAGER_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      ...authHeaders,
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

async function accessSecretVersion(secretName, projectId = readProjectId(), req) {
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

async function ensureSecretExists(secretName, projectId = readProjectId(), req) {
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

async function addSecretVersion(secretName, value, projectId = readProjectId(), req) {
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
