import { sharePointClient } from "../lib/sharepoint";

/**
 * Servicio central SharePoint
 * Fuente única de datos del ERP
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
  contratos: {
    solicitados: number;
    enviadosARevisar: number;
    rechazados: number;
  };
  directivas: {
    vencidas: number;
    porVencer: number;
    vigentes: number;
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

  for (const name of candidates) {
    if (fields[name] !== undefined) return fields[name];
  }

  const keys = Object.keys(fields);

  for (const name of candidates) {
    const k = keys.find((x) => x.toLowerCase() === name.toLowerCase());
    if (k) return fields[k];
  }

  for (const name of candidates) {
    const k = keys.find((x) => x.toLowerCase().includes(name.toLowerCase()));
    if (k) return fields[k];
  }

  return undefined;
}

function parseDate(value: any): Date | null {
  if (!value) return null;

  // SharePoint suele mandar ISO
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;

  return d;
}

/** =========================
 *  LISTAS
 *  ========================= */

export async function getTrabajadores() {
  return sharePointClient.getListItems("TBL_TRABAJADORES");
}

export async function getServicios() {
  return sharePointClient.getListItems("TBL_SERVICIOS");
}

export async function getSolicitudesContrato() {
  return sharePointClient.getListItems("SOLICITUD_CONTRATOS");
}

export async function getDirectivas() {
  return sharePointClient.getListItems("TBL_DIRECTIVAS");
}

/** =========================
 *  DASHBOARD – PASO 4
 *  ========================= */

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [trabajadores, servicios, contratos, directivas] = await Promise.all([
    getTrabajadores(),
    getServicios(),
    getSolicitudesContrato(),
    getDirectivas(),
  ]);

  // ---- TRABAJADORES
  let tActivos = 0;
  let tDesvinculados = 0;
  let tListaNegra = 0;

  (trabajadores as SpItem[]).forEach((item) => {
    const estado = normalizeChoice(pickField(item, ["Estado", "ESTADO"]));

    if (estado === "ACTIVO") tActivos++;
    else if (estado === "DESVINCULADO") tDesvinculados++;
    else if (estado === "LISTA NEGRA") tListaNegra++;
  });

  // ---- SERVICIOS
  let sActivos = 0;
  let sTerminados = 0;

  (servicios as SpItem[]).forEach((item) => {
    const estado = normalizeChoice(pickField(item, ["Estado", "ESTADO"]));

    if (estado === "ACTIVO") sActivos++;
    else if (estado === "TERMINADO") sTerminados++;
  });

  // ---- CONTRATOS
  let cSolicitados = 0;
  let cRevisar = 0;
  let cRechazados = 0;

  (contratos as SpItem[]).forEach((item) => {
    const estado = normalizeChoice(pickField(item, ["Estado", "ESTADO"]));

    if (estado === "CONTRATO SOLICITADO") cSolicitados++;
    else if (estado === "ENVIADO A REVISAR") cRevisar++;
    else if (estado === "RECHAZADO") cRechazados++;
  });

  // ---- DIRECTIVAS (VIGENCIA)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const dosMeses = new Date(hoy);
  dosMeses.setMonth(dosMeses.getMonth() + 2);

  let dVencidas = 0;
  let dPorVencer = 0;
  let dVigentes = 0;

  (directivas as SpItem[]).forEach((item) => {
    const rawFecha = pickField(item, ["VIGENCIA", "Vigencia"]);
    const fecha = parseDate(rawFecha);

    if (!fecha) return;

    if (fecha < hoy) dVencidas++;
    else if (fecha <= dosMeses) dPorVencer++;
    else dVigentes++;
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
    contratos: {
      solicitados: cSolicitados,
      enviadosARevisar: cRevisar,
      rechazados: cRechazados,
    },
    directivas: {
      vencidas: dVencidas,
      porVencer: dPorVencer,
      vigentes: dVigentes,
    },
  };
}
