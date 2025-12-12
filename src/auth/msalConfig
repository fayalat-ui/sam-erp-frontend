import type { Configuration } from "@azure/msal-browser";

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;

const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI ||
  import.meta.env.VITE_REDIRECT_URI ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : undefined,
    redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};
