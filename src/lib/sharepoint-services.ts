// src/lib/sharepoint-services.ts
import { sharePointClient } from "@/lib/sharepoint";

/**
 * Servicios centralizados para SharePoint
 * Un servicio por entidad (clientes, trabajadores, etc.)
 */

// ===============================
// TIPOS BASE
// ===============================
export interface SharePointItem {
  id: string;
  fields: Record<string, any>;
}

// ===============================
// CLIENTES
// ===============================
const LIST_CLIENTES = "TBL_CLIENTES";

export const clientesService = {
  async getAll(): Promise<SharePointItem[]> {
    return await sharePointClient.getListItems(
      LIST_CLIENTES,
      "*",
      undefined,
      "Created desc"
    );
  },

  async getById(id: string | number): Promise<SharePointItem> {
    const items = await sharePointClient.getListItems(
      LIST_CLIENTES,
      "*",
      `id eq ${id}`,
      undefined,
      1
    );

    if (!items || items.length === 0) {
      throw new Error("Cliente no encontrado");
    }

    return items[0];
  },

  async create(fields: Record<string, any>): Promise<SharePointItem> {
    return await sharePointClient.createListItem(
      LIST_CLIENTES,
      fields
    );
  },

  async update(id: string, fields: Record<string, any>): Promise<void> {
    await sharePointClient.updateListItem(
      LIST_CLIENTES,
      id,
      fields
    );
  },

  async remove(id: string): Promise<void> {
    await sharePointClient.deleteListItem(
      LIST_CLIENTES,
      id
    );
  },
};

// ===============================
// (A futuro)
// trabajadoresService
// mandantesService
// serviciosService
// ===============================
