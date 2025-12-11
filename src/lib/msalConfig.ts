import { Configuration, PopupRequest } from '@azure/msal-browser';

// Configuración de MSAL para Azure AD
export const msalConfig: Configuration = {
  auth: {
    clientId: '4523a41a-818e-4d92-8775-1ccf155e7327',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'https://yg39l-bc8771920afc40f39e5d5afd53698001-preview.app.mgx.dev',
    postLogoutRedirectUri: 'https://yg39l-bc8771920afc40f39e5d5afd53698001-preview.app.mgx.dev'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

// Configuración de la solicitud de login
export const loginRequest: PopupRequest = {
  scopes: [
    'https://graph.microsoft.com/Sites.ReadWrite.All',
    'https://graph.microsoft.com/User.Read'
  ]
};