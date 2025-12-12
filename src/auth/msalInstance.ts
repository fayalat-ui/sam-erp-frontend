import { PublicClientApplication } from "@azure/msal-browser";

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;

// IMPORTANTE: define UN solo redirectUri coherente con Azure
// Si en Azure tienes https://samerp.cl (sin /login), usa eso.
// Si en Azure tienes https://samerp.cl/login, usa eso.
const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI ||
  import.meta.env.VITE_REDIRECT_URI ||
  window.location.origin;

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId,
    authority: tenantId
      ? `https://login.microsoftonline.com/${tenantId}`
      : "https://login.microsoftonline.com/common",
    knownAuthorities: ["login.microsoftonline.com"],
    redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
});
