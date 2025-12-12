import { PublicClientApplication } from "@azure/msal-browser";

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;

// usa uno solo: VITE_AZURE_REDIRECT_URI o VITE_REDIRECT_URI
const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI ||
  import.meta.env.VITE_REDIRECT_URI ||
  window.location.origin;

export const msalInstance = new PublicClientApplication({
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
});
