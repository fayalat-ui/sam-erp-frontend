import { sharePointClient } from './sharepoint';
import { transformSharePointData, FIELD_MAPPINGS } from './sharepoint-mappings';

interface SharePointQueryOptions {
  select?: string;
  filter?: string;
  orderBy?: string;
  top?: number;
}

type SPItem = {
  id?: string | number;
  fields?: Record<string, unknown>;
} & Record<string, unknown>;

/**
 * Generic SharePoint service bound to a list name.
 * listName should match actual SharePoint list title (e.g., "Clientes", "TBL_SERVICIOS").
 */
class SharePointService<T = Record<string, unknown>> {
  constructor(private listName: string) {}

  async getAll(options: SharePointQueryOptions = {}): Promise<T[]> {
    try {
      const items = (await sharePointClient.getListItems(
        this.listName,
        options.select,
        options.filter,
        options.orderBy,
        options.top
      )) as SPItem[];

      // Normalize list name to find a FIELD_MAPPINGS key:
      // - Case-insensitive
      // - Remove common "TBL_" prefix (e.g., "TBL_SERVICIOS" -> "SERVICIOS")
      const target = this.listName.replace(/^tbl_/i, '').toLowerCase();
      const keys = Object.keys(FIELD_MAPPINGS) as Array<keyof typeof FIELD_MAPPINGS>;
      const listKey = keys.find((key) => key.toLowerCase() === target);

      if (listKey && listKey in FIELD_MAPPINGS) {
        return transformSharePointData(listKey, items) as T[];
      }

      // Fallback: flatten items to {id, ...fields}
      return items.map((item: SPItem) => {
        const id = item.id;
        const fields = item.fields ?? {};
        return { id, ...fields } as T;
      });
    } catch (error) {
      console.error(`Error fetching data from ${this.listName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<SPItem | null> {
    try {
      const items = (await sharePointClient.getListItems(this.listName, undefined, `Id eq ${id}`)) as SPItem[];
      return items[0] || null;
    } catch (error) {
      console.error(`Error fetching item ${id} from ${this.listName}:`, error);
      throw error;
    }
  }

  async create(data: Record<string, unknown>) {
    try {
      return await sharePointClient.createListItem(this.listName, data);
    } catch (error) {
      console.error(`Error creating item in ${this.listName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Record<string, unknown>) {
    try {
      return await sharePointClient.updateListItem(this.listName, id, data);
    } catch (error) {
      console.error(`Error updating item ${id} in ${this.listName}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await sharePointClient.deleteListItem(this.listName, id);
    } catch (error) {
      console.error(`Error deleting item ${id} from ${this.listName}:`, error);
      throw error;
    }
  }
}

// Service instances
export const trabajadoresService = new SharePointService('TBL_TRABAJADORES');
export const mandantesService = new SharePointService('Mandantes');
// Servicios: usar el nombre real de la lista TBL_SERVICIOS
export const serviciosService = new SharePointService('TBL_SERVICIOS');
export const contratosService = new SharePointService('Contratos');
export const cursosService = new SharePointService('Cursos');
export const usuariosService = new SharePointService('Usuarios');
export const rolesService = new SharePointService('Roles');
export const directivasService = new SharePointService('Directivas');
export const jornadasService = new SharePointService('Jornadas');
export const vacacionesService = new SharePointService('Vacaciones');
export const clientesService = new SharePointService('Clientes');

// Helper functions
export async function checkSharePointConnection() {
  try {
    await sharePointClient.initializeSite();
    return { success: true, message: 'Conexión exitosa con SharePoint' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: `Error de conexión: ${errorMessage}` };
  }
}