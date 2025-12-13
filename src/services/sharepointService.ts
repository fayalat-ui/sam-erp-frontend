import { sharePointClient } from "@/lib/sharepoint";

/**
 * Servicio central de SharePoint
 * RRHH – Trabajadores
 */

// ===============================
// TIPOS
// ===============================
export interface SharePointItem {
  id: string;
  fields: Record<string, any>;
}

// ===============================
// CONSTANTES
// ===============================
const LIST_TRABAJADORES = "TBL_TRABAJADORES";

// ===============================
// OBTENER TODOS
// ===============================
export async function getTrabajadores(): Promise<SharePointItem[]> {
  return await sharePointClient.getListItems(
    LIST_TRABAJADORES,
    "*",
    undefined,
    "Created desc"
  );
}

// ===============================
// OBTENER POR ID
// ===============================
export async function getTrabajadorById(
  id: string | number
): Promise<SharePointItem> {
  const items = await sharePointClient.getListItems(
    LIST_TRABAJADORES,
    "*",
    `id eq ${id}`,
    undefined,
    1
  );

  if (!items || items.length === 0) {
    throw new Error("Trabajador no encontrado");
  }

  return items[0];
}

// ===============================
// CREAR
// ===============================
export async function createTrabajador(
  fields: Record<string, any>
): Promise<SharePointItem> {
  return await sharePointClient.createListItem(
    LIST_TRABAJADORES,
    fields
  );
}

// ===============================
// ACTUALIZAR
// ===============================
export async function updateTrabajador(
  id: string | number,
  fields: Record<string, any>
): Promise<void> {
  await sharePointClient.updateListItem(
    LIST_TRABAJADORES,
    String(id),
    fields
  );
}

// ===============================
// ELIMINAR
// ===============================
export async function deleteTrabajador(
  id: string | number
): Promise<void> {
  await sharePointClient.deleteListItem(
    LIST_TRABAJADORES,
    String(id)
  );
}
