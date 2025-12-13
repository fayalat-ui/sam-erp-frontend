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
};

/** =========================
 *  HELPERS
 *  ========================= */

// Normaliza valores tipo Choice de SharePoint
function normalizeChoice(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v.trim().toUpperCase();
  if (typeof v === "object" && (v as any).Value)
    return String((v as any).Value).trim().toUpperCase();
  return String(v).trim().toUpperCase();
}

// Busca un campo dentro de item.fields aunque SharePoint lo renombre
function pickField(item: any, candidates: string[]) {
  const fields = item?.fields;
  if (!fields) return undefined;

  // 1) Coincidencia exacta
  for (const name of candidates) {
    if (fields[name] !== undefined) return fields[name];
  }

  // 2) Coincidencia case-insensitive
  const keys = Object.keys(fields);
  for (const name of candidates) {
    const k = keys.find(
      (x) => x.toLowerCase() === name.toLowerCase()
    );
    if (k) return fields[k];
  }

  // 3) Coincidencia parcial (Estado_x0020_, ESTADO_, etc.)
  for (const name of candidates) {
    const k = keys.find((x) =>
      x.toLowerCase().includes(name.toLowerCase())
    );
    if (k) return fields[k];
  }

  return undefined;
}

/** =========================
 *  TRABAJADORES (lectura)
 *  ========================= */

export async function getTrabajadores() {
  return sharePointClient.getListItems("TBL_TRABAJADORES");
}

/** =========================
 *  DASHBOARD – SOLO TRABAJADORES
 *  ========================= */

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const trabajadores = await sharePointClient.getListItems(
    "TBL_TRABAJADORES"
  );

  let activos = 0;
  let desvinculados = 0;
  let listaNegra = 0;

  (trabajadores as any[]).forEach((item) => {
    const rawEstado = pickField(item, ["Estado", "ESTADO"]);
    const estado = normalizeChoice(rawEstado);

    if (estado === "ACTIVO") activos++;
    else if (estado === "DESVINCULADO") desvinculados++;
    else if (estado === "LISTA NEGRA") listaNegra++;
  });

  return {
    trabajadores: {
      activos,
      desvinculados,
      listaNegra,
    },
  };
}
