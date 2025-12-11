// SharePoint List Names - Update these to match your actual SharePoint list names
export const SHAREPOINT_LISTS = {
  TRABAJADORES: 'Trabajadores',
  MANDANTES: 'Mandantes', 
  SERVICIOS: 'Servicios',
  CONTRATOS: 'Contratos',
  CURSOS: 'Cursos',
  USUARIOS: 'Usuarios',
  ROLES: 'Roles',
  DIRECTIVAS: 'Directivas',
  JORNADAS: 'Jornadas',
  VACACIONES: 'Vacaciones',
  CLIENTES: 'Clientes'
} as const;

// SharePoint Field Mappings - Map SharePoint internal field names to display names
export const FIELD_MAPPINGS = {
  TRABAJADORES: {
    'Id': 'id',
    'Title': 'nombre',
    'Apellido': 'apellido',
    'RUT': 'rut',
    'Email': 'email',
    'Telefono': 'telefono',
    'FechaIngreso': 'fecha_ingreso',
    'Estado': 'estado',
    'Cargo': 'cargo',
    'Departamento': 'departamento'
  },
  MANDANTES: {
    'Id': 'id',
    'Title': 'nombre',
    'RUT': 'rut',
    'Direccion': 'direccion',
    'Telefono': 'telefono',
    'Email': 'email',
    'Estado': 'estado',
    'FechaCreacion': 'fecha_creacion'
  },
  SERVICIOS: {
    'Id': 'id',
    'Title': 'nombre',
    'Descripcion': 'descripcion',
    'Estado': 'estado',
    'Precio': 'precio',
    'Categoria': 'categoria'
  },
  CONTRATOS: {
    'Id': 'id',
    'Title': 'nombre',
    'MandanteId': 'mandante_id',
    'FechaInicio': 'fecha_inicio',
    'FechaFin': 'fecha_fin',
    'Estado': 'estado',
    'Valor': 'valor'
  },
  USUARIOS: {
    'Id': 'id',
    'Title': 'nombre',
    'Email': 'email',
    'Estado': 'estado',
    'Rol': 'rol',
    'FechaCreacion': 'fecha_creacion'
  }
} as const;

// Transform SharePoint data to application format
export function transformSharePointData(listName: keyof typeof FIELD_MAPPINGS, items: any[]): any[] {
  const mapping = FIELD_MAPPINGS[listName];
  if (!mapping || !items) return [];

  return items.map(item => {
    const transformed: any = {};
    
    // Transform fields based on mapping
    Object.entries(mapping).forEach(([spField, appField]) => {
      if (item.fields && item.fields[spField] !== undefined) {
        transformed[appField] = item.fields[spField];
      }
    });

    return transformed;
  });
}