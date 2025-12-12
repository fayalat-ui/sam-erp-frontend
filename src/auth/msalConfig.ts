import { Configuration } from "@azure/msal-browser";

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID as string | undefined;
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID as string | undefined;

const redirectUri =
  (import.meta.env.VITE_AZURE_REDIRECT_URI as string | undefined) ||
  (import.meta.env.VITE_REDIRECT_URI as string | undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : undefined,
    redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

// ✅ ESTO es lo que te falta:
const scopesFromEnv = (import.meta.env.VITE_AZURE_SCOPES as string | undefined) || "User.Read";
export const loginRequest = {
  scopes: scopesFromEnv
    .split(/[ ,]+/)
    .map((s) => s.trim())
    .filter(Boolean),
};
