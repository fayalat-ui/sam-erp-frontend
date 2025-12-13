import { sharePointClient } from "@/lib/sharepoint";

/* ======================================================
   TIPOS
====================================================== */

export interface DashboardCounts {
  trabajadores: {
    activos: number;
    desvinculados: number;
    listaNegra: number;
  };
  servicios: {
    activos: number;
    terminados: number;
  };
}

/* ======================================================
   TRABAJADORES
====================================================== */

export async function getTrabajadores() {
  return sharePointClient.getListItems("TBL_TRABAJADORES");
}

export async function getTrabajadorById(id: string | number) {
  const items = await sharePointClient.getListItems("TBL_TRABAJADORES");
  const found = (items as any[]).find(
    (it) => String(it.id) === String(id)
  );

  if (!found) throw new Error("Trabajador no encontrado");
  return found;
}

export async function createTrabajador(fields: {
  Nombres?: string;
  Apellidos?: string;
  N_documento?: string;
  Email_Empresa?: string;
  Estado?: string;
  NACIMIENTO?: string;
}) {
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
  return sharePointClient.updateListItem(
    "TBL_TRABAJADORES",
    String(id),
    fields
  );
}

export async function deleteTrabajador(id: string | number) {
  return sharePointClient.deleteListItem(
    "TBL_TRABAJADORES",
    String(id)
  );
}

/* ======================================================
   SERVICIOS
====================================================== */

export async function getServicios() {
  return sharePointClient.getListItems("TBL_SERVICIOS");
}

/* ======================================================
   DASHBOARD
====================================================== */

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [trabajadores, servicios] = await Promise.all([
    sharePointClient.getListItems("TBL_TRABAJADORES"),
    sharePointClient.getListItems("TBL_SERVICIOS"),
  ]);

  const t = { activos: 0, desvinculados: 0, listaNegra: 0 };
  trabajadores.forEach((i: any) => {
    const e = (i.fields?.Estado || "").toUpperCase();
    if (e === "ACTIVO") t.activos++;
    else if (e === "DESVINCULADO") t.desvinculados++;
    else if (e === "LISTA NEGRA") t.listaNegra++;
  });

  const s = { activos: 0, terminados: 0 };
  servicios.forEach((i: any) => {
    const e = (i.fields?.Estado || "").toUpperCase();
    if (e === "ACTIVO") s.activos++;
    else s.terminados++;
  });

  return {
    trabajadores: t,
    servicios: s,
  };
}
