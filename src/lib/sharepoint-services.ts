import { sharePointClient } from "@/lib/sharepoint";

/**
 * Servicio SharePoint – Dashboard y RRHH
 * Fuente única de datos
 */

// ===============================
// TIPOS
// ===============================
export interface SharePointItem {
  id: string;
  fields: Record<string, any>;
}

export interface DashboardCounts {
  trabajadores: {
    activo: number;
    desvinculado: number;
    listaNegra: number;
    total: number;
  };
}

// ===============================
// CONSTANTES
// ===============================
const LIST_TRABAJADORES = "TBL_TRABAJADORES";

// ===============================
// DASHBOARD
// ===============================
export async function getDashboardCounts(): Promise<DashboardCounts> {
  const items = await sharePointClient.getListItems(
    LIST_TRABAJADORES,
    "Estado"
  );

  let activo = 0;
  let desvinculado = 0;
  let listaNegra = 0;

  for (const item of items) {
    const estado = String(item.fields?.Estado || "").toUpperCase().trim();

    if (estado === "ACTIVO") activo++;
    else if (estado === "DESVINCULADO") desvinculado++;
    else if (estado === "LISTA NEGRA") listaNegra++;
  }

  return {
    trabajadores: {
      activo,
      desvinculado,
      listaNegra,
      total: items.length,
    },
  };
}

// ===============================
// TRABAJADORES
// ===============================
export async function getTrabajadores(): Promise<SharePointItem[]> {
  return await sharePointClient.getListItems(
    LIST_TRABAJADORES,
    "*",
    undefined,
    "Created desc"
  );
}

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

export async function createTrabajador(
  fields: Record<string, any>
): Promise<SharePointItem> {
  return await sharePointClient.createListItem(
    LIST_TRABAJADORES,
    fields
  );
}

export async function updateTrabajador(
  id: string,
  fields: Record<string, any>
): Promise<void> {
  await sharePointClient.updateListItem(
    LIST_TRABAJADORES,
    id,
    fields
  );
}

export async function deleteTrabajador(
  id: string
): Promise<void> {
  await sharePointClient.deleteListItem(
    LIST_TRABAJADORES,
    id
  );
}
