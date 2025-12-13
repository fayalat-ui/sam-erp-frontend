import { sharePointClient } from "@/lib/sharepoint";

export interface SharePointItem {
  id: string;
  fields: Record<string, any>;
}

const LIST_TRABAJADORES = "TBL_TRABAJADORES";

export async function getTrabajadores(): Promise<SharePointItem[]> {
  return sharePointClient.getListItems(
    LIST_TRABAJADORES,
    "*",
    undefined,
    "Created desc"
  );
}

export async function getTrabajadorById(
  id: string | number
): Promise<SharePointItem> {
  const items = await sharePointClient.getListItems(
    LIST_TRABAJADORES,
    "*",
    `id eq ${id}`,
    undefined,
    1
  );

  if (!items || items.length === 0) {
    throw new Error("Trabajador no encontrado");
  }

  return items[0];
}

export async function createTrabajador(
  fields: Record<string, any>
): Promise<SharePointItem> {
  return sharePointClient.createListItem(
    LIST_TRABAJADORES,
    fields
  );
}

export async function updateTrabajador(
  id: string,
  fields: Record<string, any>
): Promise<void> {
  await sharePointClient.updateListItem(
    LIST_TRABAJADORES,
    id,
    fields
  );
}

export async function deleteTrabajador(id: string): Promise<void> {
  await sharePointClient.deleteListItem(
    LIST_TRABAJADORES,
    id
  );
}
