/**
 * SharePoint list names and field mappings for SAM ERP (migrated to SharePoint).
 * Ensure these names match your actual SharePoint lists. If any list name differs,
 * update SHAREPOINT_LISTS accordingly.
 */

export const SHAREPOINT_LISTS = {
  TRABAJADORES: 'TBL_TRABAJADORES', // actualizado al nombre real
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
 * Ajustado para coincidir con las columnas internas provistas.
 */
export const FIELD_MAPPINGS = {
  TRABAJADORES: {
    ID: 'id',
    Title: 'title',
    Nombres: 'nombres',
    Apellidos: 'apellidos',
    RUT: 'rut',
    Nacimiento: 'nacimiento',
    Estado_Civil: 'estado_civil',
    Celular: 'celular',
    Correo_Empresa: 'correo_empresa',
    Telefono: 'telefono',
    Direccion: 'direccion',
    Ciudad_Pais: 'ciudad_pais',
    Ciudad_Estado: 'ciudad_estado',
    Ciudad_Nombre: 'ciudad_nombre',
    Ciudad_Calle: 'ciudad_calle',
    Ciudad_CPostal: 'ciudad_cpostal',
    Ciudad_Coordenadas: 'ciudad_coordenadas',
    Cargo: 'cargo',
    Tipo_Contrato: 'tipo_contrato',
    Sueldo_Base: 'sueldo_base',
    AFP: 'afp',
    Salud: 'salud',
    Banco: 'banco',
    Tipo_Cuenta: 'tipo_cuenta',
    Numero_Cuenta: 'numero_cuenta',
    Fecha_Ingreso: 'fecha_ingreso',
    FOTO_TRABAJADOR_: 'foto_trabajador',
    DOC_CURSO: 'doc_curso',
    ESTADO_: 'estado',
    Notas: 'notas',
  },
  MANDANTES: {
    ID: 'id',
    Nombre_mandante: 'nombre',
    Rut_mandante: 'rut',
    Direccion_mandante: 'direccion',
    Razon_Social_mandante: 'razon_social',
    Giro_mandante: 'giro',
    telefono_mandante: 'telefono',
    Representante_legal: 'representante_legal',
    _OldID: 'old_id',
    Adjuntos: 'adjuntos',
    ContentTypeId: 'content_type_id',
    Modified: 'modified',
    Created: 'created',
    Author: 'author',
    Editor: 'editor',
  },
  // SERVICIOS: ajustado exactamente a los campos provistos por el usuario
  SERVICIOS: {
    ID: 'id',
    NOMBRE: 'nombre',
    RUT_CLIENTE: 'rut_cliente',
    TIPO_EMPRESA: 'tipo_empresa',
    EMPRESA: 'empresa',
    DIRECCION: 'direccion',
    UBICACION: 'ubicacion',
    ZONA: 'zona',
    DOTACION: 'dotacion',
    TELEFONO: 'telefono',
    RESPONSABLE: 'responsable',
    FECHA_INICIO: 'fecha_inicio',
    FECHA_TERMINO: 'fecha_termino',
    // Nota: Si existe la columna ESTADO en SharePoint, mantener compatibilidad:
    ESTADO: 'estado',
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