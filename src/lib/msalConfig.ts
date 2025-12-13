// src/auth/msalConfig.ts
import type { Configuration, PopupRequest } from "@azure/msal-browser";

/**
 * MSAL configuration driven by environment variables.
 * Required env vars (set in Netlify and local .env):
 * - VITE_AZURE_CLIENT_ID
 * - VITE_AZURE_TENANT_ID
 * - VITE_AZURE_REDIRECT_URI (preferred) or VITE_REDIRECT_URI (fallback)
 * - VITE_AZURE_SCOPES (comma or space separated, optional)
 */
const clientId =
  import.meta.env.VITE_AZURE_CLIENT_ID || "4523a41a-818e-4d92-8775-1ccf155e7327";

const tenantId =
  import.meta.env.VITE_AZURE_TENANT_ID || "2f7e4660-def9-427d-9c23-603e4e4dae55";

// Prefer explicit Azure redirect; fall back to generic redirect; default to /login for production
const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI ||
  import.meta.env.VITE_REDIRECT_URI ||
  "https://samerp.cl/login";

const authority = `https://login.microsoftonline.com/${tenantId}`;

// Resolve scopes from env: "User.Read,Sites.Read.All" or "User.Read Sites.Read.All"
const rawScopes = import.meta.env.VITE_AZURE_SCOPES as string | undefined;
const scopes =
  rawScopes && rawScopes.trim().length > 0
    ? rawScopes
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        // Minimal defaults for Graph access; adjust via VITE_AZURE_SCOPES if needed
        "User.Read",
        "Sites.Read.All",
      ];

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Scopes used for Microsoft Graph API requests.
export const loginRequest: PopupRequest = {
  scopes,
};

// Microsoft Graph endpoints used throughout the app.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphSitesEndpoint: "https://graph.microsoft.com/v1.0/sites",
};
