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
// =========================
// DASHBOARD (conteos)
// =========================

export type DashboardCounts = {
  trabajadores: {
    activos: number;
    desvinculados: number;
    listaNegra: number;
  };
  solicitudesContratos: {
    contratoSolicitado: number;
    enviadoARevisar: number;
    rechazado: number;
  };
  servicios: {
    activos: number;
    terminados: number;
  };
  directivas: {
    vencidas: number;
    porVencer: number;
    vigentes: number;
  };
  os10: {
    vencidas: number;
    porVencer: number;
    vigentes: number;
  };
};

function startOfTodayLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function normalizeChoice(v: unknown) {
  // SharePoint a veces devuelve Choice como string,
  // y a veces como { Value: "ACTIVO" } dependiendo del cliente.
  if (!v) return "";
  if (typeof v === "string") return v.trim().toUpperCase();
  if (typeof v === "object" && (v as any).Value) return String((v as any).Value).trim().toUpperCase();
  return String(v).trim().toUpperCase();
}

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

function bucketByVigencia(dateValue: unknown, today: Date, plus2: Date) {
  const d = parseDate(dateValue);
  if (!d) return "sin_fecha"; // no lo contamos en ninguno (o lo puedes contar aparte si quieres)
  if (d < today) return "vencida";
  if (d <= plus2) return "porVencer";
  return "vigente";
}

/**
 * Dashboard usando getListItems (sin OData). 
 * Es más pesado pero 100% compatible con tu cliente actual.
 * Luego lo optimizamos agregando filtros en el lib/sharepoint.
 */
export async function getDashboardCounts(): Promise<DashboardCounts> {
  const today = startOfTodayLocal();
  const plus2 = endOfDay(addMonths(today, 2));

  const [
    trabajadores,
    solicitudes,
    servicios,
    directivas,
    os10,
  ] = await Promise.all([
    sharePointClient.getListItems("TBL_TRABAJADORES"),
    sharePointClient.getListItems("SOLICITUD_CONTRATOS"),
    sharePointClient.getListItems("TBL_SERVICIOS"),
    sharePointClient.getListItems("TBL_DIRECTIVAS"),
    sharePointClient.getListItems("TBL_REGISTRO_CURSO_OS10"),
  ]);

  // ---- TBL_TRABAJADORES (Estado)
  let tActivos = 0, tDesv = 0, tNegra = 0;
  (trabajadores as any[]).forEach((it) => {
    const estado = normalizeChoice(it?.Estado);
    if (estado === "ACTIVO") tActivos++;
    else if (estado === "DESVINCULADO") tDesv++;
    else if (estado === "LISTA NEGRA") tNegra++;
  });

  // ---- SOLICITUD_CONTRATOS (ESTADO)
  let sSolicitado = 0, sRevisar = 0, sRechazado = 0;
  (solicitudes as any[]).forEach((it) => {
    const estado = normalizeChoice(it?.ESTADO);
    if (estado === "CONTRATO SOLICITADO") sSolicitado++;
    else if (estado === "ENVIADO A REVISAR") sRevisar++;
    else if (estado === "RECHAZADO") sRechazado++;
  });

  // ---- TBL_SERVICIOS (ESTADO)
  let srvActivos = 0, srvTerminados = 0;
  (servicios as any[]).forEach((it) => {
    const estado = normalizeChoice(it?.ESTADO);
    if (estado === "ACTIVO") srvActivos++;
    else if (estado === "TERMINADO") srvTerminados++;
  });

  // ---- TBL_DIRECTIVAS (VIGENCIA)
  let dVencidas = 0, dPorVencer = 0, dVigentes = 0;
  (directivas as any[]).forEach((it) => {
    const b = bucketByVigencia(it?.VIGENCIA, today, plus2);
    if (b === "vencida") dVencidas++;
    else if (b === "porVencer") dPorVencer++;
    else if (b === "vigente") dVigentes++;
  });

  // ---- TBL_REGISTRO_CURSO_OS10 (Vigencia)
  let oVencidas = 0, oPorVencer = 0, oVigentes = 0;
  (os10 as any[]).forEach((it) => {
    const b = bucketByVigencia(it?.Vigencia, today, plus2);
    if (b === "vencida") oVencidas++;
    else if (b === "porVencer") oPorVencer++;
    else if (b === "vigente") oVigentes++;
  });

  return {
    trabajadores: {
      activos: tActivos,
      desvinculados: tDesv,
      listaNegra: tNegra,
    },
    solicitudesContratos: {
      contratoSolicitado: sSolicitado,
      enviadoARevisar: sRevisar,
      rechazado: sRechazado,
    },
    servicios: {
      activos: srvActivos,
      terminados: srvTerminados,
    },
    directivas: {
      vencidas: dVencidas,
      porVencer: dPorVencer,
      vigentes: dVigentes,
    },
    os10: {
      vencidas: oVencidas,
      porVencer: oPorVencer,
      vigentes: oVigentes,
    },
  };
}
