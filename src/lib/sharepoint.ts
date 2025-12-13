import { sharePointClient } from "../lib/sharepoint";

/**
 * Servicio de alto nivel para consumir listas de SharePoint.
 * Cada función apunta a una lista específica.
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

/** =========================
 *  HELPERS DASHBOARD
 *  ========================= */

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
  // SharePoint puede devolver Choice como string o como { Value: "..." }
  if (!v) return "";
  if (typeof v === "string") return v.trim().toUpperCase();
  if (typeof v === "object" && (v as any).Value)
    return String((v as any).Value).trim().toUpperCase();
  return String(v).trim().toUpperCase();
}

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

function bucketByVigencia(dateValue: unknown, today: Date, plus2: Date) {
  const d = parseDate(dateValue);
  if (!d) return "sin_fecha";
  if (d < today) return "vencida";
  if (d <= plus2) return "porVencer";
  return "vigente";
}

/** =========================
 *  TRABAJADORES (CRUD)
 *  ========================= */

export async function getTrabajadores() {
  return sharePointClient.getListItems("TBL_TRABAJADORES");
}

export async function getTrabajadorById(id: string | number) {
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

/** =========================
 *  DASHBOARD (conteos correctos)
 *  =========================
 *  Regla: el dashboard NO inventa. Cuenta según tus valores:
 *  - Trabajadores Estado: ACTIVO, DESVINCULADO, LISTA NEGRA
 *  - Solicitud contratos ESTADO: CONTRATO SOLICITADO, ENVIADO A REVISAR, RECHAZADO
 *  - Servicios ESTADO: ACTIVO, TERMINADO
 *  - Directivas VIGENCIA: vencidas / por vencer 2 meses / vigentes
 *  - OS10 Vigencia: vencidas / por vencer 2 meses / vigentes
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
  let tActivos = 0,
    tDesv = 0,
    tNegra = 0;

  (trabajadores as any[]).forEach((it) => {
    // Con Graph suele venir como it.fields.Estado
    const estado = normalizeChoice(it?.fields?.Estado ?? it?.Estado);
    if (estado === "ACTIVO") tActivos++;
    else if (estado === "DESVINCULADO") tDesv++;
    else if (estado === "LISTA NEGRA") tNegra++;
  });

  // ---- SOLICITUD_CONTRATOS (ESTADO)
  let scSolicitado = 0,
    scRevisar = 0,
    scRechazado = 0;

  (solicitudes as any[]).forEach((it) => {
    const estado = normalizeChoice(it?.fields?.ESTADO ?? it?.ESTADO);
    if (estado === "CONTRATO SOLICITADO") scSolicitado++;
    else if (estado === "ENVIADO A REVISAR") scRevisar++;
    else if (estado === "RECHAZADO") scRechazado++;
  });

  // ---- TBL_SERVICIOS (ESTADO)
  let srvActivos = 0,
    srvTerminados = 0;

  (servicios as any[]).forEach((it) => {
    const estado = normalizeChoice(it?.fields?.ESTADO ?? it?.ESTADO);
    if (estado === "ACTIVO") srvActivos++;
    else if (estado === "TERMINADO") srvTerminados++;
  });

  // ---- TBL_DIRECTIVAS (VIGENCIA)
  let dVencidas = 0,
    dPorVencer = 0,
    dVigentes = 0;

  (directivas as any[]).forEach((it) => {
    const bucket = bucketByVigencia(it?.fields?.VIGENCIA ?? it?.VIGENCIA, today, plus2);
    if (bucket === "vencida") dVencidas++;
    else if (bucket === "porVencer") dPorVencer++;
    else if (bucket === "vigente") dVigentes++;
  });

  // ---- TBL_REGISTRO_CURSO_OS10 (Vigencia)
  let oVencidas = 0,
    oPorVencer = 0,
    oVigentes = 0;

  (os10 as any[]).forEach((it) => {
    const bucket = bucketByVigencia(it?.fields?.Vigencia ?? it?.Vigencia, today, plus2);
    if (bucket === "vencida") oVencidas++;
    else if (bucket === "porVencer") oPorVencer++;
    else if (bucket === "vigente") oVigentes++;
  });

  return {
    trabajadores: {
      activos: tActivos,
      desvinculados: tDesv,
      listaNegra: tNegra,
    },
    solicitudesContratos: {
      contratoSolicitado: scSolicitado,
      enviadoARevisar: scRevisar,
      rechazado: scRechazado,
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
