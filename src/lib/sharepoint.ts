import { Client } from "@microsoft/microsoft-graph-client";
import type { AuthenticationProvider } from "@microsoft/microsoft-graph-client";

// ✅ IMPORTA LA INSTANCIA ÚNICA (NO CREAR OTRO PublicClientApplication AQUÍ)
import { msalInstance } from "../auth/msalInstance"; // <-- AJUSTA ESTA RUTA SI ES NECESARIO
import { loginRequest } from "./msalConfig";

// Helpers to read environment variables for SharePoint configuration.
const SP_SITE_ID = import.meta.env.VITE_SHAREPOINT_SITE_ID as string | undefined;
const SP_HOSTNAME =
  (import.meta.env.VITE_SHAREPOINT_HOSTNAME as string | undefined) ||
  "seguryservicios.sharepoint.com";
const SP_SITE_PATH =
  (import.meta.env.VITE_SHAREPOINT_SITE_PATH as string | undefined) || "/";

// Optional list IDs via environment variables (preferred in production)
const ENV_LIST_IDS: Record<string, string | undefined> = {
  TBL_TRABAJADORES: import.meta.env.VITE_SP_LIST_TRABAJADORES_ID as
    | string
    | undefined,
  TBL_CLIENTES: import.meta.env.VITE_SP_LIST_CLIENTES_ID as string | undefined,
  TBL_SERVICIOS: import.meta.env.VITE_SP_LIST_SERVICIOS_ID as string | undefined,
  MANDANTES: import.meta.env.VITE_SP_LIST_MANDANTES_ID as string | undefined,
  VACACIONES: import.meta.env.VITE_SP_LIST_VACACIONES_ID as string | undefined,
  DIRECTIVAS: import.meta.env.VITE_SP_LIST_DIRECTIVAS_ID as string | undefined,

  // ✅ NUEVA LISTA: permisos por usuario
  TBL_USUARIOS_PERMISOS: import.meta.env.VITE_SP_LIST_USUARIOS_PERMISOS_ID as
    | string
    | undefined,

  // (Opcional) si tienes estas env en Netlify, puedes agregarlas:
  SOLICITUD_CONTRATOS: import.meta.env.VITE_SP_LIST_CONTRATOS_ID as
    | string
    | undefined,
  TBL_REGISTRO_CURSO_OS10: import.meta.env.VITE_SP_LIST_CURSOS_ID as
    | string
    | undefined,
};

// ✅ Custom authentication provider for Microsoft Graph (usando msalInstance único)
class MsalAuthProvider implements AuthenticationProvider {
  private initializedPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (!this.initializedPromise) {
      this.initializedPromise = msalInstance.initialize();
    }
    await this.initializedPromise;

    // Procesa redirect result si venías volviendo del loginRedirect
    const result = await msalInstance.handleRedirectPromise();
    if (result?.account) {
      msalInstance.setActiveAccount(result.account);
    }

    // Fallback: fija activeAccount si hay cuentas guardadas
    const active = msalInstance.getActiveAccount();
    if (!active) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }
  }

  public async getAccessToken(): Promise<string> {
    await this.ensureInitialized();

    const account =
      msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

    // En vez de lanzar "No authenticated user found", forzamos login
    if (!account) {
      await msalInstance.loginRedirect(loginRequest);
      throw new Error("Redirecting to login...");
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      return response.accessToken;
    } catch (error) {
      console.error("Silent token acquisition failed. Redirecting:", error);

      await msalInstance.acquireTokenRedirect({
        ...loginRequest,
        account,
      });

      throw new Error("Redirecting to acquire token...");
    }
  }
}

class SharePointClient {
  private graphClient: Client;
  private siteId = "";
  private authProvider: MsalAuthProvider;
  private listIdCache = new Map<string, string>();

  constructor() {
    this.authProvider = new MsalAuthProvider();
    this.graphClient = Client.initWithMiddleware({
      authProvider: this.authProvider,
    });
  }

  private isGuid(id: string) {
    return /^[0-9a-fA-F-]{36}$/.test(id);
  }

  async initializeSite() {
    try {
      if (this.siteId) return { id: this.siteId };

      if (SP_SITE_ID) {
        const site = await this.graphClient.api(`/sites/${SP_SITE_ID}`).get();
        this.siteId = site.id;
        console.log(
          "SharePoint site initialized by ID:",
          site.displayName || site.id
        );
        return site;
      }

      const site = await this.graphClient
        .api(`/sites/${SP_HOSTNAME}:${SP_SITE_PATH}`)
        .get();
      this.siteId = site.id;
      console.log("SharePoint site initialized by host/path:", site.displayName);
      return site;
    } catch (error) {
      console.error("Error initializing SharePoint site:", error);
      throw error;
    }
  }

  private async resolveListId(nameOrId: string): Promise<string> {
    if (!nameOrId) throw new Error("List identifier is required");

    if (this.isGuid(nameOrId)) return nameOrId;

    const envId = ENV_LIST_IDS[nameOrId];
    if (envId && this.isGuid(envId)) return envId;

    const cached = this.listIdCache.get(nameOrId);
    if (cached) return cached;

    if (!this.siteId) {
      await this.initializeSite();
    }

    const res = await this.graphClient
      .api(`/sites/${this.siteId}/lists`)
      .filter(`displayName eq '${nameOrId}'`)
      .get();

    const list = Array.isArray(res?.value) ? res.value[0] : null;
    if (!list?.id) {
      throw new Error(`List not found by displayName: ${nameOrId}`);
    }

    this.listIdCache.set(nameOrId, list.id);
    return list.id;
  }

  async getListItems(listNameOrId: string): Promise<SharePointListItem[]> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      const listId = await this.resolveListId(listNameOrId);

      const response = await this.graphClient
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .expand("fields")
        .top(5000)
        .get();

      return (response.value as SharePointListItem[]) || [];
    } catch (error) {
      console.error(`Error getting list items from ${listNameOrId}:`, error);
      throw error;
    }
  }

  async createListItem(
    listNameOrId: string,
    fields: Record<string, unknown>
  ): Promise<SharePointListItem> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      const listId = await this.resolveListId(listNameOrId);

      const response = await this.graphClient
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .post({ fields });

      return response as SharePointListItem;
    } catch (error) {
      console.error(`Error creating item in ${listNameOrId}:`, error);
      throw error;
    }
  }

  async updateListItem(
    listNameOrId: string,
    itemId: string,
    fields: Record<string, unknow
