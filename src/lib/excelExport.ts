import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
}

export const exportToExcel = (
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  fileName: string = 'reporte'
): void => {
  try {
    if (!data || data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const excelData = data.map(row => {
      const excelRow: Record<string, unknown> = {};
      columns.forEach(col => {
        excelRow[col.label] = row[col.key] || '';
      });
      return excelRow;
    });

    // Crear workbook y worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Configurar anchos de columna
    const columnWidths = columns.map(col => ({
      wch: col.width || 15
    }));
    worksheet['!cols'] = columnWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    // Generar archivo y descargar
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFileName = `${fileName}_${timestamp}.xlsx`;
    
    XLSX.writeFile(workbook, fullFileName);
    toast.success(`Archivo ${fullFileName} descargado exitosamente`);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Error al exportar a Excel');
  }
};

// Configuraciones predefinidas para cada módulo
export const exportConfigs = {
  trabajadores: {
    columns: [
      { key: 'rut', label: 'RUT', width: 12 },
      { key: 'nombre_completo', label: 'Nombre Completo', width: 25 },
      { key: 'email_personal', label: 'Email', width: 25 },
      { key: 'celular', label: 'Teléfono', width: 15 },
      { key: 'rol', label: 'Rol', width: 20 },
      { key: 'estado', label: 'Estado', width: 12 },
      { key: 'fecha_ingreso', label: 'Fecha Ingreso', width: 15 }
    ],
    fileName: 'trabajadores'
  },
  clientes: {
    columns: [
      { key: 'rut', label: 'RUT', width: 12 },
      { key: 'razon_social', label: 'Razón Social', width: 30 },
      { key: 'nombre_contacto', label: 'Contacto', width: 25 },
      { key: 'email', label: 'Email', width: 25 },
      { key: 'telefono', label: 'Teléfono', width: 15 },
      { key: 'direccion', label: 'Dirección', width: 35 }
    ],
    fileName: 'clientes'
  },
  servicios: {
    columns: [
      { key: 'nombre', label: 'Nombre del Servicio', width: 30 },
      { key: 'descripcion', label: 'Descripción', width: 40 },
      { key: 'precio_base', label: 'Precio Base', width: 15 },
      { key: 'created_at', label: 'Fecha Creación', width: 15 }
    ],
    fileName: 'servicios'
  },
  directivas: {
    columns: [
      { key: 'titulo', label: 'Título', width: 30 },
      { key: 'descripcion', label: 'Descripción', width: 40 },
      { key: 'fecha_vigencia', label: 'Fecha Vigencia', width: 15 },
      { key: 'estado', label: 'Estado', width: 12 }
    ],
    fileName: 'directivas'
  },
  jornadas: {
    columns: [
      { key: 'trabajador_nombre', label: 'Trabajador', width: 25 },
      { key: 'fecha', label: 'Fecha', width: 12 },
      { key: 'hora_inicio', label: 'Hora Inicio', width: 12 },
      { key: 'hora_fin', label: 'Hora Fin', width: 12 },
      { key: 'horas_trabajadas', label: 'Horas Trabajadas', width: 15 },
      { key: 'observaciones', label: 'Observaciones', width: 30 }
    ],
    fileName: 'jornadas'
  }
};