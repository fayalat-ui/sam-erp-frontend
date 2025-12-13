import { Client } from "@microsoft/microsoft-graph-client";
import type { AuthenticationProvider } from "@microsoft/microsoft-graph-client";

import { msalInstance } from "../auth/msalInstance";
import { loginRequest } from "./msalConfig";

/* ===============================
   Configuración básica
================================ */

const SP_SITE_ID = import.meta.env.VITE_SHAREPOINT_SITE_ID as string | undefined;
const SP_HOSTNAME =
  (import.meta.env.VITE_SHAREPOINT_HOSTNAME as string | undefined) ||
  "seguryservicios.sharepoint.com";
const SP_SITE_PATH =
  (import.meta.env.VITE_SHAREPOINT_SITE_PATH as string | undefined) || "/";

const ENV_LIST_IDS: Record<string, string | undefined> = {
  TBL_TRABAJADORES: import.meta.env.VITE_SP_LIST_TRABAJADORES_ID,
  TBL_SERVICIOS: import.meta.env.VITE_SP_LIST_SERVICIOS_ID,
  TBL_MANDANTES: import.meta.env.VITE_SP_LIST_MANDANTES_ID,
  TBL_VACACIONES: import.meta.env.VITE_SP_LIST_VACACIONES_ID,
  TBL_DIRECTIVAS: import.meta.env.VITE_SP_LIST_DIRECTIVAS_ID,
  SOLICITUD_CONTRATOS: import.meta.env.VITE_SP_LIST_CONTRATOS_ID,
  TBL_REGISTRO_CURSO_OS10: import.meta.env.VITE_SP_LIST_CURSOS_ID,
  TBL_USUARIOS_PERMISOS: import.meta.env.VITE_SP_LIST_USUARIOS_PERMISOS_ID,
};

/* ===============================
   Auth Provider
================================ */

class MsalAuthProvider implements AuthenticationProvider {
  async getAccessToken(): Promise<string> {
    const account =
      msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

    if (!account) {
      await msalInstance.loginRedirect(loginRequest);
      throw new Error("Redirecting to login");
    }

    const result = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });

    return result.accessToken;
  }
}

/* ===============================
   Cliente SharePoint
================================ */

class SharePointClient {
  private client: Client;
  private siteId: string | null = null;
  private listCache = new Map<string, string>();

  constructor() {
    this.client = Client.initWithMiddleware({
      authProvider: new MsalAuthProvider(),
    });
  }

  private isGuid(v: string) {
    return /^[0-9a-fA-F-]{36}$/.test(v);
  }

  private async ensureSite() {
    if (this.siteId) return;

    if (SP_SITE_ID) {
      const site = await this.client.api(`/sites/${SP_SITE_ID}`).get();
      this.siteId = site.id;
      return;
    }

    const site = await this.client
      .api(`/sites/${SP_HOSTNAME}:${SP_SITE_PATH}`)
      .get();

    this.siteId = site.id;
  }

  private async resolveListId(name: string): Promise<string> {
    if (this.isGuid(name)) return name;

    const env = ENV_LIST_IDS[name];
    if (env && this.isGuid(env)) return env;

    const cached = this.listCache.get(name);
    if (cached) return cached;

    await this.ensureSite();

    const res = await this.client
      .api(`/sites/${this.siteId}/lists`)
      .filter(`displayName eq '${name}'`)
      .get();

    const list = res?.value?.[0];
    if (!list?.id) throw new Error(`Lista no encontrada: ${name}`);

    this.listCache.set(name, list.id);
    return list.id;
  }

  async getListItems(listName: string): Promise<any[]> {
    await this.ensureSite();
    const listId = await this.resolveListId(listName);

    const res = await this.client
      .api(`/sites/${this.siteId}/lists/${listId}/items`)
      .expand("fields")
      .top(5000)
      .get();

    return res?.value ?? [];
  }

  async createListItem(listName: string, fields: Record<string, any>) {
    await this.ensureSite();
    const listId = await this.resolveListId(listName);

    return this.client
      .api(`/sites/${this.siteId}/lists/${listId}/items`)
      .post({ fields });
  }

  async updateListItem(
    listName: string,
    itemId: string,
    fields: Record<string, any>
  ) {
    await this.ensureSite();
    const listId = await this.resolveListId(listName);

    return this.client
      .api(`/sites/${this.siteId}/lists/${listId}/items/${itemId}/fields`)
      .patch(fields);
  }

  async deleteListItem(listName: string, itemId: string) {
    await this.ensureSite();
    const listId = await this.resolveListId(listName);

    await this.client
      .api(`/sites/${this.siteId}/lists/${listId}/items/${itemId}`)
      .delete();
  }
}

/* ===============================
   Export
================================ */

export const sharePointClient = new SharePointClient();

export async function checkSharePointConnection() {
  try {
    await sharePointClient.getListItems("TBL_TRABAJADORES");
    return { success: true, message: "Conexión exitosa con SharePoint" };
  } catch (e: any) {
    return { success: false, message: e?.message ?? "Error de conexión" };
  }
}
