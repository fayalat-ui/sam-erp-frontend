import type { AccountInfo, SilentRequest } from "@azure/msal-browser";
import { msalInstance } from "./msalInstance";
import { loginRequest } from "./msalConfig";

function pickAccount(): AccountInfo | null {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length ? accounts[0] : null;
}

// ✅ ESTO es lo que Netlify dice que falta:
export async function getAccessToken(scopes: string[] = loginRequest.scopes): Promise<string> {
  const account = pickAccount();
  if (!account) throw new Error("No hay sesión activa (MSAL). Inicia sesión primero.");

  const req: SilentRequest = { account, scopes };
  const res = await msalInstance.acquireTokenSilent(req);
  return res.accessToken;
}
