import { sharePointClient } from "../lib/sharepoint";

/**
 * Servicio de alto nivel para consumir listas de SharePoint.
 * Cada función apunta a una lista específica.
 */

/** =========================
 *  TRABAJADORES (CRUD)
 *  ========================= */

export async function getTrabajadores() {
  return sharePointClient.getListItems("TBL_TRABAJADORES");
}

export async function getTrabajadorById(id: string | number) {
  // Implementación simple: trae lista y filtra por id.
  // (Si luego quieres optimizar, lo hacemos con endpoint directo)
  const items = await sharePointClient.getListItems("TBL_TRABAJADORES");
  const found = (items as any[]).find((it) => String(it.id) === String(id));
  if (!found) throw new Error("Trabajador no encontrado");
  return found;
}

export async function createTrabajador(fields: {
  Nombres?: string;
  Apellidos?: string;
  N_documento?: string;
  Email_Empresa?: string;
  Estado?: string;
  NACIMIENTO?: string; // YYYY-MM-DD
}) {
  const title =
    `${fields.Nombres ?? ""} ${fields.Apellidos ?? ""}`.trim() ||
    fields.N_documento ||
    "Trabajador";

  const payload: Record<string, unknown> = {
    Title: title,
    ...fields,
  };

  return sharePointClient.createListItem("TBL_TRABAJADORES", payload);
}

export async function updateTrabajador(
  id: string | number,
  fields: Record<string, unknown>
) {
  return sharePointClient.updateListItem("TBL_TRABAJADORES", String(id), fields);
}

export async function deleteTrabajador(id: string | number) {
  return sharePointClient.deleteListItem("TBL_TRABAJADORES", String(id));
}

/** =========================
 *  OTRAS LISTAS (LECTURA)
 *  ========================= */

export async function getMandantes() {
  return sharePointClient.getListItems("TBL_MANDANTES");
}

export async function getServicios() {
  return sharePointClient.getListItems("TBL_SERVICIOS");
}

export async function getVacaciones() {
  return sharePointClient.getListItems("TBL_VACACIONES");
}

export async function getDirectivas() {
  return sharePointClient.getListItems("TBL_DIRECTIVAS");
}

export async function getSolicitudesContrato() {
  return sharePointClient.getListItems("SOLICITUD_CONTRATOS");
}

export async function getCursosOS10() {
  return sharePointClient.getListItems("TBL_REGISTRO_CURSO_OS10");
}
