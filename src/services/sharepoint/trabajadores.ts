import { sharePointClient } from "@/lib/sharepoint";

const LIST_NAME = "TBL_TRABAJADORES";

/**
 * Cache: evita pegarle a Graph /columns en cada guardado.
 */
const columnsCache = new Map<
  string,
  { byDisplay: Map<string, string>; byName: Map<string, string> }
>();

function flattenItem(item: any) {
  const fields = item?.fields ?? {};
  return { id: item?.id, ...fields };
}

async function getColumnsMap(listName: string) {
  const cached = columnsCache.get(listName);
  if (cached) return cached;

  const cols = await sharePointClient.getListColumns(listName);

  const byDisplay = new Map<string, string>();
  const byName = new Map<string, string>();

  for (const c of cols ?? []) {
    const name = String(c?.name ?? "").trim(); // internal name (Graph)
    const displayName = String(c?.displayName ?? "").trim(); // visible name
    if (name) byName.set(name, name);
    if (displayName && name) byDisplay.set(displayName, name);
  }

  const maps = { byDisplay, byName };
  columnsCache.set(listName, maps);
  return maps;
}

/**
 * Convierte keys del payload:
 * - si vienen como displayName (lo que ves en SharePoint) => internal name real
 * - si ya vienen como internal => se dejan
 * - si no se reconocen => se dejan (para que el error diga cuál falta)
 */
async function normalizeFields(listName: string, fields: Record<string, any>) {
  const { byDisplay, byName } = await getColumnsMap(listName);

  const out: Record<string, any> = {};

  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;

    const key = String(k).trim();

    if (byName.has(key)) {
      out[key] = v;
      continue;
    }

    const internal = byDisplay.get(key);
    if (internal) {
      out[internal] = v;
      continue;
    }

    out[key] = v;
  }

  return out;
}

export async function getTrabajadorById(id: string) {
  const items = await sharePointClient.getListItems(LIST_NAME);
  const found = items?.find((it: any) => String(it?.id) === String(id));
  if (!found) throw new Error("Trabajador no encontrado");
  return flattenItem(found);
}

export async function updateTrabajador(id: string, fields: Record<string, any>) {
  const normalized = await normalizeFields(LIST_NAME, fields);
  await sharePointClient.updateListItem(LIST_NAME, String(id), normalized);
  return await getTrabajadorById(String(id));
}

// Opcional: si quieres ver internal vs display (debug)
export async function debugTrabajadoresColumns() {
  const cols = await sharePointClient.getListColumns(LIST_NAME);
  return (cols ?? []).map((c: any) => ({
    name: c?.name,
    displayName: c?.displayName,
    type: c?.columnType,
  }));
}
