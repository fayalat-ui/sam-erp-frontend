import type {
  AccountInfo,
  AuthenticationResult,
  PopupRequest,
  RedirectRequest,
  SilentRequest,
} from "@azure/msal-browser";
import { msalInstance } from "./msalInstance";

const scopesFromEnv = (import.meta.env.VITE_AZURE_SCOPES as string | undefined) || "User.Read";
const defaultScopes = scopesFromEnv
  .split(/[ ,]+/)
  .map((s) => s.trim())
  .filter(Boolean);

function pickAccount(): AccountInfo | null {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length ? accounts[0] : null;
}

export const authService = {
  getAccount(): AccountInfo | null {
    return pickAccount();
  },

  async loginPopup(extra?: Partial<PopupRequest>): Promise<AuthenticationResult> {
    const req: PopupRequest = { scopes: defaultScopes, ...extra };
    return msalInstance.loginPopup(req);
  },

  async loginRedirect(extra?: Partial<RedirectRequest>): Promise<void> {
    const req: RedirectRequest = { scopes: defaultScopes, ...extra };
    return msalInstance.loginRedirect(req);
  },

  async logout(): Promise<void> {
    const account = pickAccount() ?? undefined;
    await msalInstance.logoutPopup({ account });
  },

  async acquireToken(scopes?: string[]): Promise<string> {
    const account = pickAccount();
    if (!account) throw new Error("No hay sesión activa (MSAL). Inicia sesión primero.");

    const req: SilentRequest = {
      account,
      scopes: scopes?.length ? scopes : defaultScopes,
    };

    const res = await msalInstance.acquireTokenSilent(req);
    return res.accessToken;
  },
};
