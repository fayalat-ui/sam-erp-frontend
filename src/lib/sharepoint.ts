import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from './msalConfig';

// Helpers to read environment variables for SharePoint configuration.
const SP_SITE_ID = import.meta.env.VITE_SHAREPOINT_SITE_ID as string | undefined;
const SP_HOSTNAME = (import.meta.env.VITE_SHAREPOINT_HOSTNAME as string | undefined) || 'seguryservicios.sharepoint.com';
const SP_SITE_PATH = (import.meta.env.VITE_SHAREPOINT_SITE_PATH as string | undefined) || '/';

// Optional list IDs via environment variables (preferred in production)
const ENV_LIST_IDS: Record<string, string | undefined> = {
  TBL_TRABAJADORES: import.meta.env.VITE_SP_LIST_TRABAJADORES_ID as string | undefined,
  TBL_CLIENTES: import.meta.env.VITE_SP_LIST_CLIENTES_ID as string | undefined,
  TBL_SERVICIOS: import.meta.env.VITE_SP_LIST_SERVICIOS_ID as string | undefined,
  MANDANTES: import.meta.env.VITE_SP_LIST_MANDANTES_ID as string | undefined,
  VACACIONES: import.meta.env.VITE_SP_LIST_VACACIONES_ID as string | undefined,
  DIRECTIVAS: import.meta.env.VITE_SP_LIST_DIRECTIVAS_ID as string | undefined,
};

// Custom authentication provider for Microsoft Graph
class MsalAuthProvider implements AuthenticationProvider {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async getAccessToken(): Promise<string> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No authenticated user found');
    }

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      try {
        const response = await this.msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError);
        throw new Error('Failed to acquire access token');
      }
    }
  }
}

class SharePointClient {
  private graphClient: Client;
  private siteId: string = '';
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
        console.log('SharePoint site initialized by ID:', site.displayName || site.id);
        return site;
      }

      const site = await this.graphClient.api(`/sites/${SP_HOSTNAME}:${SP_SITE_PATH}`).get();
      this.siteId = site.id;
      console.log('SharePoint site initialized by host/path:', site.displayName);
      return site;
    } catch (error) {
      console.error('Error initializing SharePoint site:', error);
      throw error;
    }
  }

  private async resolveListId(nameOrId: string): Promise<string> {
    if (!nameOrId) throw new Error('List identifier is required');

    // If passed an ID
    if (this.isGuid(nameOrId)) return nameOrId;

    // Use env override if present
    const envId = ENV_LIST_IDS[nameOrId];
    if (envId && this.isGuid(envId)) return envId;

    // Cache
    const cached = this.listIdCache.get(nameOrId);
    if (cached) return cached;

    // Ensure site initialized
    if (!this.siteId) {
      await this.initializeSite();
    }

    // Lookup by displayName
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

  /**
   * Get list items with optional fields selection, filter, orderBy, and top.
   * When 'select' is provided, we apply it to fields via $expand=fields($select=...)
   */
  async getListItems(
    listNameOrId: string,
    select?: string,
    filter?: string,
    orderBy?: string,
    top?: number
  ): Promise<SharePointListItem[]> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      const listId = await this.resolveListId(listNameOrId);

      // Build expand for fields selection
      let expandArg = 'fields';
      if (select && typeof select === 'string') {
        const fieldNames = select
          .split(',')
          .map((s) => s.trim())
          // Exclude ID/id from fields selection; 'id' is top-level on listItem
          .filter((s) => s.toLowerCase() !== 'id' && s.length > 0);

        if (fieldNames.length > 0) {
          expandArg = `fields($select=${fieldNames.join(',')})`;
        }
      }

      let query = this.graphClient
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .expand(expandArg);

      // Only apply filter/orderby/top for valid inputs
      if (filter && filter.trim().length > 0) {
        query = query.filter(filter);
      }
      if (orderBy && orderBy.trim().length > 0) {
        query = query.orderby(orderBy);
      }
      if (top && Number.isFinite(top)) {
        query = query.top(top as number);
      }

      const response = await query.get();
      return response.value || [];
    } catch (error) {
      console.error(`Error getting list items from ${listNameOrId}:`, error);
      throw error;
    }
  }

  async createListItem(listNameOrId: string, fields: Record<string, unknown>): Promise<SharePointListItem> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }
      const listId = await this.resolveListId(listNameOrId);

      const response = await this.graphClient.api(`/sites/${this.siteId}/lists/${listId}/items`).post({
        fields: fields,
      });

      return response;
    } catch (error) {
      console.error(`Error creating item in ${listNameOrId}:`, error);
      throw error;
    }
  }

  async updateListItem(listNameOrId: string, itemId: string, fields: Record<string, unknown>): Promise<SharePointListItem> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }
      const listId = await this.resolveListId(listNameOrId);

      const response = await this.graphClient
        .api(`/sites/${this.siteId}/lists/${listId}/items/${itemId}/fields`)
        .patch(fields);

      return response;
    } catch (error) {
      console.error(`Error updating item in ${listNameOrId}:`, error);
      throw error;
    }
  }

  async deleteListItem(listNameOrId: string, itemId: string): Promise<void> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }
      const listId = await this.resolveListId(listNameOrId);

      await this.graphClient.api(`/sites/${this.siteId}/lists/${listId}/items/${itemId}`).delete();
    } catch (error) {
      console.error(`Error deleting item from ${listNameOrId}:`, error);
      throw error;
    }
  }

  async uploadFile(libraryName: string, fileName: string, fileContent: Blob): Promise<DriveItem> {
    try {
      if (!this.siteId) {
        await this.initializeSite();
      }

      const response = await this.graphClient
        .api(`/sites/${this.siteId}/drive/root:/${libraryName}/${fileName}:/content`)
        .put(fileContent);

      return response;
    } catch (error) {
      console.error(`Error uploading file to ${libraryName}:`, error);
      throw error;
    }
  }
}

// Types
interface SharePointListItem {
  id: string;
  fields: Record<string, unknown>;
  [key: string]: unknown;
}

interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
  [key: string]: unknown;
}

// Export singleton instance
export const sharePointClient = new SharePointClient();

// Export function to check connection
export async function checkSharePointConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await sharePointClient.initializeSite();
    return { success: true, message: 'Conexión exitosa con SharePoint' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: `Error de conexión: ${errorMessage}` };
  }
}