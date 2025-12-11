import { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: "4523a41a-818e-4d92-8775-1ccf155e7327", // Application (client) ID from Azure portal
    authority: "https://login.microsoftonline.com/2f7e4660-def9-427d-9c23-603e4e4dae55", // Directory (tenant) ID
    redirectUri: "https://samerp.cl", // Must be registered as a redirect URI in Azure portal
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
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
    "Notes.Read.All"
  ],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphSitesEndpoint: "https://graph.microsoft.com/v1.0/sites",
};