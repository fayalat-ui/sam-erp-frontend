// src/lib/sharepoint-services.ts
import { sharePointClient } from "@/lib/sharepoint";

/**
 * Servicios centralizados SharePoint
 * Un service por lista, usado por las páginas
 */

// ===============================
// TIPOS BASE
// ===============================
export interface SharePointItem {
  id: string;
  fields: Record<string, any>;
}

// ===============================
// HELPERS
// ===============================
async function getAll(list: string) {
  return await sharePointClient.getListItems(list, "*", undefined, "Created desc");
}

async function getById(list: string, id: string | number) {
  const items = await sharePointClient.getListItems(
    list,
    "*",
    `id eq ${id}`,
    undefined,
    1
  );
  if (!items || items.length === 0) {
    throw new Error("Registro no encontrado");
  }
  return items[0];
}

async function create(list: string, fields: Record<string, any>) {
  return await sharePointClient.createListItem(list, fields);
}

async function update(list: string, id: string, fields: Record<string, any>) {
  await sharePointClient.updateListItem(list, id, fields);
}

async function remove(list: string, id: string) {
  await sharePointClient.deleteListItem(list, id);
}

// ===============================
// CLIENTES
// ===============================
export const clientesService = {
  getAll: () => getAll("TBL_CLIENTES"),
  getById: (id: string | number) => getById("TBL_CLIENTES", id),
  create: (f: any) => create("TBL_CLIENTES", f),
  update: (id: string, f: any) => update("TBL_CLIENTES", id, f),
  remove: (id: string) => remove("TBL_CLIENTES", id),
};

// ===============================
// MANDANTES
// ===============================
export const mandantesService = {
  getAll: () => getAll("TBL_MANDANTES"),
  getById: (id: string | number) => getById("TBL_MANDANTES", id),
  create: (f: any) => create("TBL_MANDANTES", f),
  update: (id: string, f: any) => update("TBL_MANDANTES", id, f),
  remove: (id: string) => remove("TBL_MANDANTES", id),
};

// ===============================
// SERVICIOS
// ===============================
export const serviciosService = {
  getAll: () => getAll("TBL_SERVICIOS"),
  getById: (id: string | number) => getById("TBL_SERVICIOS", id),
  create: (f: any) => create("TBL_SERVICIOS", f),
  update: (id: string, f: any) => update("TBL_SERVICIOS", id, f),
  remove: (id: string) => remove("TBL_SERVICIOS", id),
};

// ===============================
// VACACIONES
// ===============================
export const vacacionesService = {
  getAll: () => getAll("TBL_VACACIONES"),
  getById: (id: string | number) => getById("TBL_VACACIONES", id),
  create: (f: any) => create("TBL_VACACIONES", f),
  update: (id: string, f: any) => update("TBL_VACACIONES", id, f),
  remove: (id: string) => remove("TBL_VACACIONES", id),
};

// ===============================
// DIRECTIVAS ✅ (EL QUE FALTABA)
// ===============================
export const directivasService = {
  getAll: () => getAll("TBL_DIRECTIVAS"),
  getById: (id: string | number) => getById("TBL_DIRECTIVAS", id),
  create: (f: any) => create("TBL_DIRECTIVAS", f),
  update: (id: string, f: any) => update("TBL_DIRECTIVAS", id, f),
  remove: (id: string) => remove("TBL_DIRECTIVAS", id),
};
