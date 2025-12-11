import { sharePointClient } from './sharepoint';
import { transformSharePointData, FIELD_MAPPINGS } from './sharepoint-mappings';

interface SharePointQueryOptions {
  select?: string;
  filter?: string;
  orderBy?: string;
  top?: number;
}

class SharePointService {
  constructor(private listName: string) {}

  async getAll(options: SharePointQueryOptions = {}) {
    try {
      const items = await sharePointClient.getListItems(
        this.listName,
        options.select,
        options.filter
      );
      
      // Transform data if mapping exists
      const listKey = Object.keys(FIELD_MAPPINGS).find(
        key => FIELD_MAPPINGS[key as keyof typeof FIELD_MAPPINGS]
      );
      
      if (listKey && listKey in FIELD_MAPPINGS) {
        return transformSharePointData(listKey as keyof typeof FIELD_MAPPINGS, items);
      }
      
      return items.map(item => ({
        id: item.id,
        ...item.fields
      }));
    } catch (error) {
      console.error(`Error fetching data from ${this.listName}:`, error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const items = await sharePointClient.getListItems(
        this.listName,
        undefined,
        `Id eq ${id}`
      );
      return items[0] || null;
    } catch (error) {
      console.error(`Error fetching item ${id} from ${this.listName}:`, error);
      throw error;
    }
  }

  async create(data: Record<string, any>) {
    try {
      return await sharePointClient.createListItem(this.listName, data);
    } catch (error) {
      console.error(`Error creating item in ${this.listName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Record<string, any>) {
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
export const trabajadoresService = new SharePointService('Trabajadores');
export const mandantesService = new SharePointService('Mandantes');
export const serviciosService = new SharePointService('Servicios');
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: `Error de conexión: ${errorMessage}` };
  }
}