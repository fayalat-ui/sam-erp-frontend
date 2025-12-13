import { sharePointClient } from "@/lib/sharepoint";

const LIST_NAME = "TBL_TRABAJADORES";

/**
 * Nota: Graph devuelve items como { id, fields: {...} }.
 * Para trabajar cómodo, devolvemos un objeto plano con id + fields mezclado.
 */
function flattenItem(item: any) {
  const fields = item?.fields ?? {};
  return {
    id: item?.id,
    ...fields,
  };
}

export async function getTrabajadorById(id: string) {
  const items = await sharePointClient.getListItems(LIST_NAME);
  const found = items?.find((it: any) => String(it?.id) === String(id));
  if (!found) throw new Error("Trabajador no encontrado");
  return flattenItem(found);
}

export async function updateTrabajador(id: string, fields: Record<string, any>) {
  // SharePoint/Graph requiere PATCH a /fields (tu cliente ya lo hace)
  await sharePointClient.updateListItem(LIST_NAME, String(id), fields);

  // Opcional: devolver el registro actualizado
  return await getTrabajadorById(String(id));
}
