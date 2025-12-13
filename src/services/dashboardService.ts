// src/services/dashboardService.ts
// Servicio de Dashboard: TODA la lógica de conteos vive aquí.
// El componente solo consume el resultado.

export type SharePointQueryOptions = {
  select?: string;
  filter?: string;
  orderBy?: string;
  top?: number;
};

export type SharePointClient = {
  // Firma mínima necesaria (como tu getAll actual)
  getAll: <T = any>(listName: string, options?: SharePointQueryOptions) => Promise<T[]>;
};

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

function escapeODataString(v: string) {
  // Para strings con comillas simples en OData
  return v.replace(/'/g, "''");
}

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

async function countByValue(
  sp: SharePointClient,
  listName: string,
  field: string,
  value: string
) {
  const filter = `${field} eq '${escapeODataString(value)}'`;
  const items = await sp.getAll(listName, { select: "Id", filter, top: 5000 });
  return items.length;
}

async function countByDateBuckets(
  sp: SharePointClient,
  listName: string,
  field: string
) {
  const today = startOfTodayLocal();
  const todayISO = today.toISOString();

  const plus2 = endOfDay(addMonths(today, 2));
  const plus2ISO = plus2.toISOString();

  const vencidas = (
    await sp.getAll(listName, {
      select: "Id",
      filter: `${field} lt datetime'${todayISO}'`,
      top: 5000,
    })
  ).length;

  const porVencer = (
    await sp.getAll(listName, {
      select: "Id",
      filter: `${field} ge datetime'${todayISO}' and ${field} le datetime'${plus2ISO}'`,
      top: 5000,
    })
  ).length;

  const vigentes = (
    await sp.getAll(listName, {
      select: "Id",
      filter: `${field} gt datetime'${plus2ISO}'`,
      top: 5000,
    })
  ).length;

  return { vencidas, porVencer, vigentes };
}

export async function fetchDashboardCounts(sp: SharePointClient): Promise<DashboardCounts> {
  // Listas / columnas (tal como pediste)
  const LIST_TRABAJADORES = "TBL_TRABAJADORES";
  const LIST_SOL_CONTRATOS = "SOLICITUD_CONTRATOS";
  const LIST_SERVICIOS = "TBL_SERVICIOS";
  const LIST_DIRECTIVAS = "TBL_DIRECTIVAS";
  const LIST_OS10 = "TBL_REGISTRO_CURSO_OS10";

  // Workers: Estado
  const [
    trabajadoresActivos,
    trabajadoresDesvinculados,
    trabajadoresListaNegra,

    solContratoSolicitado,
    solEnviadoARevisar,
    solRechazado,

    serviciosActivos,
    serviciosTerminados,

    directivasBuckets,
    os10Buckets,
  ] = await Promise.all([
    countByValue(sp, LIST_TRABAJADORES, "Estado", "ACTIVO"),
    countByValue(sp, LIST_TRABAJADORES, "Estado", "DESVINCULADO"),
    countByValue(sp, LIST_TRABAJADORES, "Estado", "LISTA NEGRA"),

    countByValue(sp, LIST_SOL_CONTRATOS, "ESTADO", "CONTRATO SOLICITADO"),
    countByValue(sp, LIST_SOL_CONTRATOS, "ESTADO", "ENVIADO A REVISAR"),
    countByValue(sp, LIST_SOL_CONTRATOS, "ESTADO", "RECHAZADO"),

    countByValue(sp, LIST_SERVICIOS, "ESTADO", "ACTIVO"),
    countByValue(sp, LIST_SERVICIOS, "ESTADO", "TERMINADO"),

    countByDateBuckets(sp, LIST_DIRECTIVAS, "VIGENCIA"),
    countByDateBuckets(sp, LIST_OS10, "Vigencia"),
  ]);

  return {
    trabajadores: {
      activos: trabajadoresActivos,
      desvinculados: trabajadoresDesvinculados,
      listaNegra: trabajadoresListaNegra,
    },
    solicitudesContratos: {
      contratoSolicitado: solContratoSolicitado,
      enviadoARevisar: solEnviadoARevisar,
      rechazado: solRechazado,
    },
    servicios: {
      activos: serviciosActivos,
      terminados: serviciosTerminados,
    },
    directivas: directivasBuckets,
    os10: os10Buckets,
  };
}
