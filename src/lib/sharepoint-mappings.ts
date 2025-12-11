/**
 * SharePoint list names and field mappings for SAM ERP (migrated to SharePoint).
 * Ensure these names match your actual SharePoint lists. If any list name differs,
 * update SHAREPOINT_LISTS accordingly.
 */

export const SHAREPOINT_LISTS = {
  TRABAJADORES: 'Trabajadores',
  MANDANTES: 'Mandantes',
  SERVICIOS: 'TBL_SERVICIOS', // actualizado según nombres provistos
  CONTRATOS: 'Contratos',
  CURSOS: 'Cursos',
  USUARIOS: 'Usuarios',
  ROLES: 'Roles',
  DIRECTIVAS: 'Directivas',
  JORNADAS: 'Jornadas',
  VACACIONES: 'Vacaciones',
  CLIENTES: 'Clientes',
} as const;

type Mapping = Record<string, string>;

/**
 * FIELD_MAPPINGS: Map SharePoint internal field names → app field names per list.
 * Ajustado para coincidir con la lista TBL_SERVICIOS y sus columnas internas.
 */
export const FIELD_MAPPINGS = {
  TRABAJADORES: {
    Id: 'id',
    Title: 'nombre', // e.g., full name or first name
    Apellido: 'apellido',
    RUT: 'rut',
    Email: 'email',
    Telefono: 'telefono',
    Cargo: 'cargo',
    Departamento: 'departamento',
    FechaIngreso: 'fecha_ingreso',
    Estado: 'activo', // boolean o texto
  },
  MANDANTES: {
    Id: 'id',
    Title: 'nombre',
    RUT: 'rut',
    Direccion: 'direccion',
    Telefono: 'telefono',
    Email: 'email',
    Estado: 'estado',
    FechaCreacion: 'fecha_creacion',
    Contacto: 'contacto',
  },
  // Mapeo real de TBL_SERVICIOS
  SERVICIOS: {
    ID: 'id',
    NOMBRE: 'nombre',
    RUT_CLIENTE: 'rut_cliente',
    TIPO_EMPRESA: 'tipo_empresa',
    EMPRESA: 'empresa',
    DIRECCION: 'direccion',
    UBICACION: 'ubicacion', // json estructurado
    ZONA: 'zona',
    DOTACION: 'dotacion',
    TELEFONO: 'telefono',
    RESPONSABLE: 'responsable',
    FECHA_INICIO: 'fecha_inicio_raw', // guardamos texto crudo
    ESTADO: 'estado',
    CODIGO_ZONA: 'codigo_zona',
    CIUDAD: 'ciudad',
    EMPRESA_CONTRATISTA: 'empresa_contratista',
    RUT_EMPRESA: 'rut_empresa',
    TIPO_JORNADA: 'tipo_jornada',
    COL19: 'col19',
    COL20: 'col20',
    ACTIVO_NUM: 'activo_num', // integer (0 habitual)
    CALLE: 'calle',
    CIUDAD2: 'ciudad2',
    PAIS: 'pais',
    GEOM: 'geom', // texto: "Point (lon lat)"; si se activa PostGIS, cambiar tipo
  },
  CONTRATOS: {
    Id: 'id',
    Title: 'nombre',
    MandanteId: 'mandante_id',
    FechaInicio: 'fecha_inicio',
    FechaFin: 'fecha_fin',
    Estado: 'estado',
    Valor: 'valor',
  },
  USUARIOS: {
    Id: 'id',
    Title: 'nombre',
    Email: 'email',
    Estado: 'estado',
    Rol: 'rol',
    FechaCreacion: 'fecha_creacion',
  },
  CLIENTES: {
    Id: 'id',
    Title: 'razon_social',
    RUT: 'rut',
    NombreContacto: 'nombre_contacto',
    Email: 'email',
    Telefono: 'telefono',
    Direccion: 'direccion',
    Estado: 'estado',
  },
  VACACIONES: {
    Id: 'id',
    TrabajadorId: 'trabajador_id',
    TrabajadorNombre: 'trabajador_nombre',
    FechaInicio: 'fecha_inicio',
    FechaFin: 'fecha_fin',
    DiasSolicitados: 'dias_solicitados',
    Estado: 'estado',
    Observaciones: 'observaciones',
  },
  DIRECTIVAS: {
    Id: 'id',
    Title: 'titulo',
    Descripcion: 'descripcion',
    Numero: 'numero',
    FechaEmision: 'fecha_emision',
    Vigente: 'vigente',
    Categoria: 'categoria',
    ArchivoUrl: 'archivo_url',
  },
} as const;

type FieldMappings = typeof FIELD_MAPPINGS;
type FieldMappingKey = keyof FieldMappings;

type SPItemBase = {
  id?: string | number;
  fields?: Record<string, unknown>;
} & Record<string, unknown>;

/**
 * Transform SharePoint items to app format using FIELD_MAPPINGS.
 * listName: one of the FIELD_MAPPINGS keys (uppercase).
 */
export function transformSharePointData<K extends FieldMappingKey, T = Record<string, unknown>>(
  listName: K,
  items: SPItemBase[]
): T[] {
  const mapping: Mapping = FIELD_MAPPINGS[listName] as Mapping;
  if (!mapping || !items) return [];

  return items.map((item) => {
    const transformed: Record<string, unknown> = {};
    const fields = (item?.fields ?? item) as Record<string, unknown>;

    // Siempre incluir 'id'
    transformed.id = (item?.id ??
      (fields?.Id as string | number | undefined) ??
      (fields?.ID as string | number | undefined)) as string | number | undefined;

    Object.entries(mapping).forEach(([spField, appField]) => {
      if (fields && Object.prototype.hasOwnProperty.call(fields, spField)) {
        transformed[appField] = fields[spField];
      }
    });

    return transformed as T;
  });
}