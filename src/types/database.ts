export type Database = {
  public: {
    Tables: {
      tbl_trabajadores: {
        Row: {
          id_trabajador: number;
          rut: string;
          nombres: string;
          apellidos: string;
          nombre_completo: string | null;
          fecha_nacimiento: string | null;
          genero: string | null;
          nacionalidad: string | null;
          estado_civil: string | null;
          email_personal: string | null;
          celular: string | null;
          tel_emergencia: string | null;
          ciudad: string | null;
          estudios: string | null;
          rol: string | null;
          estado: string | null;
          foto_trabajador_: string | null;
          banco_pago: string | null;
          tipo_cuenta_pago: string | null;
          numero_cuenta_pago: string | null;
          titular_cuenta_pago: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_trabajadores']['Row'], 'id_trabajador'>;
        Update: Partial<Database['public']['Tables']['tbl_trabajadores']['Insert']>;
      };
      tbl_clientes: {
        Row: {
          Id_clientes: number;
          RUT: string | null;
          razon_social: string | null;
          nombre_contacto: string | null;
          correo_electronico: string | null;
          telefono: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_clientes']['Row'], 'Id_clientes'>;
        Update: Partial<Database['public']['Tables']['tbl_clientes']['Insert']>;
      };
      tbl_mandantes: {
        Row: {
          Id_mandante: number;
          nombre_mandante: string | null;
          rut_mandante: string | null;
          Direccion_mandante: string | null;
          razon_Social_mandante: string | null;
          Giro_mandante: string | null;
          telefono_mandante: number | null;
          firma: number | null;
          representante_legal: string | null;
          logo: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_mandantes']['Row'], 'Id_mandante'>;
        Update: Partial<Database['public']['Tables']['tbl_mandantes']['Insert']>;
      };
      tbl_servicios: {
        Row: {
          Id_servicios: number;
          nombre_servicio: string | null;
          Id_mandante: number | null;
          direccion_servicio: string | null;
          zona: string | null;
          cantidad_guardias: number | null;
          telefono_servicio: string | null;
          fecha_inicio: string | null;
          estado_servicio: string | null;
          Id_supervisor: number | null;
          ciudad: string | null;
          tipo_jornada: string | null;
          contrato_pdf: string | null;
          Id_cliente: number | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_servicios']['Row'], 'Id_servicios'>;
        Update: Partial<Database['public']['Tables']['tbl_servicios']['Insert']>;
      };
      tbl_solicitud_contratos: {
        Row: {
          Id_contrato: number;
          estado: string | null;
          Id_cargo: number | null;
          FACCION_: string | null;
          Id_mandante: number | null;
          FECHA_INICIO: string | null;
          fecha_vigencia: string | null;
          observaciones_contrato: string | null;
          jornada: string | null;
          tipo: string | null;
          horas_semanal: string | null;
          horario_laboral: string | null;
          horario_colacion: string | null;
          AFP_: string | null;
          ISAPRE: string | null;
          SUELDO_BASE: string | null;
          B_COLACION: string | null;
          B_MOVILIZACION: string | null;
          B_VIATICO: string | null;
          B_INSTALACION: string | null;
          ADJUNTA_CONTRATO: number | null;
          SOLICITANTE_: string | null;
          Id_trabajador: number | null;
          Id_servicio: number | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_solicitud_contratos']['Row'], 'Id_contrato'>;
        Update: Partial<Database['public']['Tables']['tbl_solicitud_contratos']['Insert']>;
      };
      tbl_registro_cursos_os10: {
        Row: {
          ID_REG_CURSO_OS10: number;
          CURSO_: string | null;
          F_REALIZADO: string | null;
          VIGENCIA: string | null;
          Observacion: string | null;
          REFERENCIA: string | null;
          DOC_CURSO: string | null;
          ID_TRABAJADOR: number | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_registro_cursos_os10']['Row'], 'ID_REG_CURSO_OS10'>;
        Update: Partial<Database['public']['Tables']['tbl_registro_cursos_os10']['Insert']>;
      };
      tbl_vacaciones: {
        Row: {
          id_vacacion: string;
          id_trabajador: number | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          dias_solicitados: number | null;
          dias_correspondientes: number | null;
          tipo_vacacion: string | null;
          estado: string | null;
          observaciones: string | null;
          fecha_creacion: string | null;
          fecha_actualizacion: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_vacaciones']['Row'], 'id_vacacion'>;
        Update: Partial<Database['public']['Tables']['tbl_vacaciones']['Insert']>;
      };
      tbl_directivas: {
        Row: {
          Id_directiva: number;
          fecha_aprobacion: string | null;
          fecha_vigencia: string | null;
          adjunto_pdf: string | null;
          cantidad_guardias: string | null;
          cantidad_facciones: string | null;
          autoridad_fiscalizadora: number | null;
          estado_servicios: string | null;
          observaciones: string | null;
          Id_servicio: number | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_directivas']['Row'], 'Id_directiva'>;
        Update: Partial<Database['public']['Tables']['tbl_directivas']['Insert']>;
      };
      tbl_cargos: {
        Row: {
          Id_cargo: number;
          CARGO: string | null;
          ROL: string | null;
          DESCRIPCION: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_cargos']['Row'], 'Id_cargo'>;
        Update: Partial<Database['public']['Tables']['tbl_cargos']['Insert']>;
      };
      tbl_autoridad_fiscalizadora: {
        Row: {
          Id_AF: number;
          created_at: string | null;
          Institucion: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_autoridad_fiscalizadora']['Row'], 'Id_AF'>;
        Update: Partial<Database['public']['Tables']['tbl_autoridad_fiscalizadora']['Insert']>;
      };
      tbl_usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          rol_id: number | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tbl_usuarios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tbl_usuarios']['Insert']>;
      };
      tbl_roles: {
        Row: {
          id: number;
          nombre: string;
          descripcion: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tbl_roles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tbl_roles']['Insert']>;
      };
      tbl_permisos: {
        Row: {
          id: number;
          modulo: string;
          accion: string;
          descripcion: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tbl_permisos']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['tbl_permisos']['Insert']>;
      };
      tbl_rol_permisos: {
        Row: {
          id: number;
          rol_id: number;
          permiso_id: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tbl_rol_permisos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tbl_rol_permisos']['Insert']>;
      };
    };
  };
};

export type UserRole = Database['public']['Tables']['tbl_roles']['Row'];
export type Permission = Database['public']['Tables']['tbl_permisos']['Row'];
export type Usuario = Database['public']['Tables']['tbl_usuarios']['Row'];