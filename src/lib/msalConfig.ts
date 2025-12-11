import { Configuration, PopupRequest } from '@azure/msal-browser';

// Configuración de MSAL para Azure AD con tenant específico
export const msalConfig: Configuration = {
  auth: {
    clientId: '4523a41a-818e-4d92-8775-1ccf155e7327',
    authority: 'https://login.microsoftonline.com/2f7e4660-def9-427d-9c23-603e4e4dae55', // Tenant específico de SAMERP
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 1: // Error
            console.error('[MSAL Error]:', message);
            return;
          case 2: // Warning
            console.warn('[MSAL Warning]:', message);
            return;
          case 3: // Info
            console.info('[MSAL Info]:', message);
            return;
          case 4: // Verbose
            console.debug('[MSAL Debug]:', message);
            return;
          default:
            return;
        }
      }
    }
  }
};

// Configuración de la solicitud de login
export const loginRequest: PopupRequest = {
  scopes: [
    'User.Read',
    'Sites.Read.All', 
    'Sites.ReadWrite.All',
    'Files.ReadWrite.All'
  ],
  prompt: 'select_account'
};

// Configuración de endpoints de Microsoft Graph
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphSitesEndpoint: 'https://graph.microsoft.com/v1.0/sites'
};