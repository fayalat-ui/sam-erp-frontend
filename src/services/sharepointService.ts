import { sharePointClient } from "../lib/sharepoint";

/**
 * Servicio de alto nivel para consumir listas de SharePoint.
 * Incluye lecturas y CRUD de trabajadores.
 * Incluye conteos para Dashboard (Trabajadores + Servicios).
 */

/** =========================
 *  TIPOS
 *  ========================= */

export type DashboardCounts = {
  trabajadores: {
    activos: number;
    desvinculados: number;
    listaNegra: number;
  };
  servicios: {
    activos: number;
    terminados: number;
  };
};

type SpItem = { id: string; fields: Record<string, any> };

/** =========================
 *  HELPERS (robustos SharePoint)
 *  ========================= */

function normalizeChoice(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v.trim().toUpperCase();
  if (typeof v === "object" && (v as any).Value)
    return String((v as any).Value).trim().toUpperCase();
  return String(v).trim().toUpperCase();
}

function pickField(item: any, candidates: string[]) {
  const fields = item?.fields;
  if (!fields) return undefined;

  // 1) Exacto
  for (const name of candidates) {
    if (fields[name] !== undefined) return fields[name];
  }

  // 2) Case-insensitive
  const keys = Object.keys(fields);
  for (const name of candidates) {
    const k = keys.find((x) => x.toLowerCase() === name.toLowerCase());
    if (k) return fields[k];
  }

  // 3) Parcial (por si SharePoint renombra internamente)
  for (const name of candidates) {
    const k = keys.find((x) => x.toLowerCase().includes(name.toLowerCase()));
    if (k) return fields[k];
  }

  return undefined;
}

/** =========================
 *  TRABAJADORES (CRUD)
 *  ========================= */

export async function getTrabajadores() {
  return sharePointClient.getListItems("TBL_TRABAJADORES");
}

export async function getTrabajadorById(id: string | number) {
  const items = (await sharePointClient.getListItems(
    "TBL_TRABAJADORES"
  )) as SpItem[];

  const found = items.find((it) => String(it.id) === String(id));
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
  [key: string]: any;
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
  // Nota: algunos proyectos usan "TBL_MANDANTES"; otros "MANDANTES".
  // Si tu lista se llama "TBL_MANDANTES", cámbialo aquí.
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

/** =========================
 *  DASHBOARD – Trabajadores + Servicios
 *  ========================= */

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [trabajadores, servicios] = await Promise.all([
    sharePointClient.getListItems("TBL_TRABAJADORES"),
    sharePointClient.getListItems("TBL_SERVICIOS"),
  ]);

  // ---- TRABAJADORES (Estado = ACTIVO/DESVINCULADO/LISTA NEGRA)
  let tActivos = 0;
  let tDesvinculados = 0;
  let tListaNegra = 0;

  (trabajadores as any[]).forEach((item) => {
    const raw = pickField(item, ["Estado", "ESTADO"]);
    const estado = normalizeChoice(raw);

    if (estado === "ACTIVO") tActivos++;
    else if (estado === "DESVINCULADO") tDesvinculados++;
    else if (estado === "LISTA NEGRA") tListaNegra++;
  });

  // ---- SERVICIOS (ESTADO = ACTIVO/TERMINADO)
  let sActivos = 0;
  let sTerminados = 0;

  (servicios as any[]).forEach((item) => {
    const raw = pickField(item, ["ESTADO", "Estado"]);
    const estado = normalizeChoice(raw);

    if (estado === "ACTIVO") sActivos++;
    else if (estado === "TERMINADO") sTerminados++;
  });

  return {
    trabajadores: {
      activos: tActivos,
      desvinculados: tDesvinculados,
      listaNegra: tListaNegra,
    },
    servicios: {
      activos: sActivos,
      terminados: sTerminados,
    },
  };
}
