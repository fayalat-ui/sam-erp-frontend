import { sharePointClient } from "../lib/sharepoint";

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
    const k = keys.find(
      (x) => x.toLowerCase() === name.toLowerCase()
    );
    if (k) return fields[k];
  }

  // Parcial (Estado_, ESTADO_x0020_)
  for (const name of candidates) {
    const k = keys.find((x) =>
      x.toLowerCase().includes(name.toLowerCase())
    );
    if (k) return fields[k];
  }

  return undefined;
}

/** =========================
 *  TRABAJADORES
 *  ========================= */

export async function getTrabajadores() {
  return sharePointClient.getListItems("TBL_TRABAJADORES");
}

export async function getTrabajadorById(id: string | number) {
  const items = await sharePointClient.getListItems("TBL_TRABAJADORES");
  const found = (items as any[]).find(
    (it) => String(it.id) === String(id)
  );

  if (!found) {
    throw new Error("Trabajador no encontrado");
  }

  return found;
}

/** =========================
 *  SERVICIOS
 *  ========================= */

export async function getServicios() {
  return sharePointClient.getListItems("TBL_SERVICIOS");
}

/** =========================
 *  DASHBOARD – TRABAJADORES + SERVICIOS
 *  ========================= */

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [trabajadores, servicios] = await Promise.all([
    sharePointClient.getListItems("TBL_TRABAJADORES"),
    sharePointClient.getListItems("TBL_SERVICIOS"),
  ]);

  // ---- TRABAJADORES
  let tActivos = 0;
  let tDesvinculados = 0;
  let tListaNegra = 0;

  (trabajadores as any[]).forEach((item) => {
    const rawEstado = pickField(item, ["Estado", "ESTADO"]);
    const estado = normalizeChoice(rawEstado);

    if (estado === "ACTIVO") tActivos++;
    else if (estado === "DESVINCULADO") tDesvinculados++;
    else if (estado === "LISTA NEGRA") tListaNegra++;
  });

  // ---- SERVICIOS
  let sActivos = 0;
  let sTerminados = 0;

  (servicios as any[]).forEach((item) => {
    const rawEstado = pickField(item, ["ESTADO", "Estado"]);
    const estado = normalizeChoice(rawEstado);

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
