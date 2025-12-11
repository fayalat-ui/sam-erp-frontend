import { Configuration, PopupRequest } from "@azure/msal-browser";

/**
 * MSAL configuration driven by environment variables.
 * Required env vars (set in Netlify and local .env):
 * - VITE_AZURE_CLIENT_ID
 * - VITE_AZURE_TENANT_ID
 * - VITE_REDIRECT_URI
 */
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || "4523a41a-818e-4d92-8775-1ccf155e7327";
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || "2f7e4660-def9-427d-9c23-603e4e4dae55";
const redirectUri = import.meta.env.VITE_REDIRECT_URI || "https://samerp.cl";
const authority = `https://login.microsoftonline.com/${tenantId}`;

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

// Add scopes here for ID token to be used at Microsoft Graph API endpoints.
export const loginRequest: PopupRequest = {
  scopes: [
    "User.Read",
    "Sites.Read.All",
    "Sites.ReadWrite.All",
    "Files.Read.All",
    "Files.ReadWrite.All",
    "Group.Read.All",
    "Directory.Read.All",
    "User.ReadBasic.All",
    "Calendars.Read",
    "Mail.Read",
    "Tasks.Read",
    "Notes.Read.All",
  ],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphSitesEndpoint: "https://graph.microsoft.com/v1.0/sites",
};