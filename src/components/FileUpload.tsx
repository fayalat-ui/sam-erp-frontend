import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Download } from 'lucide-react';
import { uploadFile, deleteFile, downloadFile, FileUploadResult } from '@/lib/fileUpload';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileUploaded?: (result: FileUploadResult) => void;
  currentFile?: string | null;
  folder?: string;
  label?: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  currentFile,
  folder = 'general',
  label = 'Archivo adjunto',
  accept = '.pdf,.jpg,.jpeg,.png'
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(selectedFile, 'documents', folder);
      
      if (result.success) {
        toast.success('Archivo subido exitosamente');
        onFileUploaded?.(result);
        setSelectedFile(null);
        // Reset input
        const input = document.getElementById('file-upload') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        toast.error(result.error || 'Error al subir archivo');
      }
    } catch (error) {
      toast.error('Error inesperado al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentFile) return;
    
    if (confirm('¿Estás seguro de eliminar este archivo?')) {
      const success = await deleteFile(currentFile);
      if (success) {
        toast.success('Archivo eliminado');
        onFileUploaded?.({ success: true, url: '', path: '' });
      } else {
        toast.error('Error al eliminar archivo');
      }
    }
  };

  const handleDownload = () => {
    if (currentFile) {
      downloadFile(currentFile);
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {currentFile ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {currentFile.split('/').pop()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Input
                  id="file-upload"
                  type="file"
                  accept={accept}
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos permitidos: PDF, JPG, PNG (máx. 5MB)
                </p>
              </div>
              
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    size="sm"
                  >
                    {uploading ? (
                      'Subiendo...'
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};