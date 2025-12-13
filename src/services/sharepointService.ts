import { sharePointClient } from "../lib/sharepoint";

/**
 * Servicio central de SharePoint
 * Fuente única de datos para toda la app
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

type SpItem = {
  id: string;
  fields: Record<string, any>;
};

/** =========================
 *  HELPERS
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

  // Exacto
  for (const name of candidates) {
    if (fields[name] !== undefined) return fields[name];
  }

  // Case-insensitive
  const keys = Object.keys(fields);
  for (const name of candidates) {
    const k = keys.find((x) => x.toLowerCase() === name.toLowerCase());
    if (k) return fields[k];
  }

  // Parcial (SharePoint interno)
  for (const name of candidates) {
    const k = keys.find((x) =>
      x.toLowerCase().includes(name.toLowerCase())
    );
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
  const items = (await getTrabajadores()) as SpItem[];
  const found = items.find((it) => String(it.id) === String(id));
  if (!found) throw new Error("Trabajador no encontrado");
  return found;
}

export async function createTrabajador(fields: Record<string, any>) {
  const title =
    `${fields.Nombres ?? ""} ${fields.Apellidos ?? ""}`.trim() ||
    fields.N_documento ||
    "Trabajador";

  return sharePointClient.createListItem("TBL_TRABAJADORES", {
    Title: title,
    ...fields,
  });
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
 *  SERVICIOS (LECTURA)
 *  ========================= */

export async function getServicios() {
  return sharePointClient.getListItems("TBL_SERVICIOS");
}

/** =========================
 *  OTRAS LISTAS (LECTURA)
 *  ========================= */

export async function getMandantes() {
  return sharePointClient.getListItems("TBL_MANDANTES");
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
 *  DASHBOARD – TRABAJADORES + SERVICIOS
 *  ========================= */

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [trabajadores, servicios] = await Promise.all([
    getTrabajadores(),
    getServicios(),
  ]);

  // ---- TRABAJADORES
  let tActivos = 0;
  let tDesvinculados = 0;
  let tListaNegra = 0;

  (trabajadores as SpItem[]).forEach((item) => {
    const estado = normalizeChoice(
      pickField(item, ["Estado", "ESTADO"])
    );

    if (estado === "ACTIVO") tActivos++;
    else if (estado === "DESVINCULADO") tDesvinculados++;
    else if (estado === "LISTA NEGRA") tListaNegra++;
  });

  // ---- SERVICIOS
  let sActivos = 0;
  let sTerminados = 0;

  (servicios as SpItem[]).forEach((item) => {
    const estado = normalizeChoice(
      pickField(item, ["ESTADO", "Estado"])
    );

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
