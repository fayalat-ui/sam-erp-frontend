import { supabase } from './supabase';
import { toast } from 'sonner';

export interface FileUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

interface FileUploadHandlerResult {
  success: boolean;
  path?: string;
}

export const uploadFile = async (
  file: File,
  bucket: string = 'documents',
  folder: string = 'general'
): Promise<FileUploadResult> => {
  try {
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG.'
      };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      };
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: `Error al subir archivo: ${error.message}`
      };
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl,
      path: fileName
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Error inesperado al subir archivo'
    };
  }
};

export const deleteFile = async (
  filePath: string,
  bucket: string = 'documents'
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

export const downloadFile = async (
  filePath: string,
  bucket: string = 'documents'
): Promise<void> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      toast.error('Error al descargar archivo');
      return;
    }

    // Crear URL temporal para descarga
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filePath.split('/').pop() || 'archivo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download error:', error);
    toast.error('Error al descargar archivo');
  }
};

// Función helper para manejar resultados de subida
export const handleFileUploadResult = (
  result: FileUploadResult,
  setFormData: (updater: (prev: Record<string, string>) => Record<string, string>) => void
): void => {
  if (result.success && result.path) {
    setFormData(prev => ({
      ...prev,
      archivo_adjunto: result.path || ''
    }));
  } else if (result.path === '') {
    setFormData(prev => ({
      ...prev,
      archivo_adjunto: ''
    }));
  }
};