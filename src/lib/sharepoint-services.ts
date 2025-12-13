// src/lib/sharepoint-services.ts
import { sharePointClient } from "@/lib/sharepoint";

/**
 * Servicios centralizados de SharePoint
 * Un servicio por entidad
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
    return await sharePointClient.createListItem(LIST_CLIENTES, fields);
  },

  async update(id: string, fields: Record<string, any>): Promise<void> {
    await sharePointClient.updateListItem(LIST_CLIENTES, id, fields);
  },

  async remove(id: string): Promise<void> {
    await sharePointClient.deleteListItem(LIST_CLIENTES, id);
  },
};

// ===============================
// MANDANTES
// ===============================
const LIST_MANDANTES = "TBL_MANDANTES";

export const mandantesService = {
  async getAll(): Promise<SharePointItem[]> {
    return await sharePointClient.getListItems(
      LIST_MANDANTES,
      "*",
      undefined,
      "Created desc"
    );
  },

  async getById(id: string | number): Promise<SharePointItem> {
    const items = await sharePointClient.getListItems(
      LIST_MANDANTES,
      "*",
      `id eq ${id}`,
      undefined,
      1
    );

    if (!items || items.length === 0) {
      throw new Error("Mandante no encontrado");
    }

    return items[0];
  },

  async create(fields: Record<string, any>): Promise<SharePointItem> {
    return await sharePointClient.createListItem(LIST_MANDANTES, fields);
  },

  async update(id: string, fields: Record<string, any>): Promise<void> {
    await sharePointClient.updateListItem(LIST_MANDANTES, id, fields);
  },

  async remove(id: string): Promise<void> {
    await sharePointClient.deleteListItem(LIST_MANDANTES, id);
  },
};

// ===============================
// SERVICIOS
// ===============================
const LIST_SERVICIOS = "TBL_SERVICIOS";

export const serviciosService = {
  async getAll(): Promise<SharePointItem[]> {
    return await sharePointClient.getListItems(
      LIST_SERVICIOS,
      "*",
      undefined,
      "Created desc"
    );
  },

  async getById(id: string | number): Promise<SharePointItem> {
    const items = await sharePointClient.getListItems(
      LIST_SERVICIOS,
      "*",
      `id eq ${id}`,
      undefined,
      1
    );

    if (!items || items.length === 0) {
      throw new Error("Servicio no encontrado");
    }

    return items[0];
  },

  async create(fields: Record<string, any>): Promise<SharePointItem> {
    return await sharePointClient.createListItem(LIST_SERVICIOS, fields);
  },

  async update(id: string, fields: Record<string, any>): Promise<void> {
    await sharePointClient.updateListItem(LIST_SERVICIOS, id, fields);
  },

  async remove(id: string): Promise<void> {
    await sharePointClient.deleteListItem(LIST_SERVICIOS, id);
  },
};

// ===============================
// VACACIONES ✅ (NUEVO)
// ===============================
const LIST_VACACIONES = "TBL_VACACIONES";

export const vacacionesService = {
  async getAll(): Promise<SharePointItem[]> {
    return await sharePointClient.getListItems(
      LIST_VACACIONES,
      "*",
      undefined,
      "Created desc"
    );
  },

  async getById(id: string | number): Promise<SharePointItem> {
    const items = await sharePointClient.getListItems(
      LIST_VACACIONES,
      "*",
      `id eq ${id}`,
      undefined,
      1
    );

    if (!items || items.length === 0) {
      throw new Error("Vacación no encontrada");
    }

    return items[0];
  },

  async create(fields: Record<string, any>): Promise<SharePointItem> {
    return await sharePointClient.createListItem(LIST_VACACIONES, fields);
  },

  async update(id: string, fields: Record<string, any>): Promise<void> {
    await sharePointClient.updateListItem(LIST_VACACIONES, id, fields);
  },

  async remove(id: string): Promise<void> {
    await sharePointClient.deleteListItem(LIST_VACACIONES, id);
  },
};
