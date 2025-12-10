import { useEffect, useState } from 'react';
import { getPublicData, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';
import { ExportButton } from '@/components/ExportButton';
import { exportConfigs } from '@/lib/excelExport';
import { handleFileUploadResult, FileUploadResult } from '@/lib/fileUpload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Directiva = {
  id_directiva: string;
  titulo: string;
  descripcion: string;
  fecha_vigencia: string;
  estado: string;
  archivo_adjunto?: string;
  created_at: string;
};

export default function Directivas() {
  const [directivas, setDirectivas] = useState<Directiva[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_vigencia: '',
    estado: 'Activa',
    archivo_adjunto: ''
  });

  useEffect(() => {
    loadDirectivas();
  }, []);

  const loadDirectivas = async () => {
    try {
      const { data, error } = await getPublicData('app_61b67b0a14_directivas');
      
      if (error) {
        console.error('Error loading directivas:', error);
        toast.error('Error al cargar directivas: ' + error);
      } else {
        setDirectivas(data || []);
      }
    } catch (error) {
      console.error('Error loading directivas:', error);
      toast.error('Error de conexión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('app_61b67b0a14_directivas')
        .insert([{
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fecha_vigencia: formData.fecha_vigencia,
          estado: formData.estado,
          archivo_adjunto: formData.archivo_adjunto
        }]);

      if (error) {
        toast.error('Error al crear directiva: ' + error.message);
      } else {
        toast.success('Directiva creada exitosamente');
        setIsDialogOpen(false);
        setFormData({
          titulo: '',
          descripcion: '',
          fecha_vigencia: '',
          estado: 'Activa',
          archivo_adjunto: ''
        });
        loadDirectivas();
      }
    } catch (error) {
      toast.error('Error al crear directiva');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta directiva?')) return;
    
    try {
      const { error } = await supabase
        .from('app_61b67b0a14_directivas')
        .delete()
        .eq('id_directiva', id);

      if (error) {
        toast.error('Error al eliminar directiva: ' + error.message);
      } else {
        toast.success('Directiva eliminada exitosamente');
        loadDirectivas();
      }
    } catch (error) {
      toast.error('Error al eliminar directiva');
      console.error(error);
    }
  };

  const handleFileUploaded = (result: FileUploadResult) => {
    handleFileUploadResult(result, setFormData);
  };

  const filteredDirectivas = directivas.filter((d) => {
    const search = searchTerm.toLowerCase();
    return (
      d.titulo?.toLowerCase().includes(search) ||
      d.descripcion?.toLowerCase().includes(search) ||
      d.estado?.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Activa': 'default',
      'Inactiva': 'secondary',
      'Vencida': 'destructive',
    };

    return (
      <Badge variant={variants[estado] || 'secondary'}>
        {estado}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Directivas</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de directivas empresariales</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredDirectivas}
            columns={exportConfigs.directivas.columns}
            fileName={exportConfigs.directivas.fileName}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Directiva
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Directiva</DialogTitle>
                <DialogDescription>
                  Completa los datos de la nueva directiva
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="titulo" className="text-right">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="descripcion" className="text-right mt-2">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="col-span-3"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fecha_vigencia" className="text-right">Fecha Vigencia</Label>
                  <Input
                    id="fecha_vigencia"
                    type="date"
                    value={formData.fecha_vigencia}
                    onChange={(e) => setFormData({...formData, fecha_vigencia: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estado" className="text-right">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({...formData, estado: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activa">Activa</SelectItem>
                      <SelectItem value="Inactiva">Inactiva</SelectItem>
                      <SelectItem value="Vencida">Vencida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Archivo</Label>
                  <div className="col-span-3">
                    <FileUpload
                      onFileUploaded={handleFileUploaded}
                      currentFile={formData.archivo_adjunto}
                      folder="directivas"
                      label=""
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Guardar Directiva
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Directivas ({directivas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por título, descripción o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha Vigencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDirectivas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {directivas.length === 0 
                        ? "No hay directivas registradas" 
                        : "No se encontraron directivas con ese criterio de búsqueda"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDirectivas.map((directiva) => (
                    <TableRow key={directiva.id_directiva}>
                      <TableCell className="font-medium">{directiva.titulo}</TableCell>
                      <TableCell className="max-w-xs truncate">{directiva.descripcion}</TableCell>
                      <TableCell>{new Date(directiva.fecha_vigencia).toLocaleDateString()}</TableCell>
                      <TableCell>{getEstadoBadge(directiva.estado)}</TableCell>
                      <TableCell>
                        {directiva.archivo_adjunto ? (
                          <Badge variant="outline">📎 Adjunto</Badge>
                        ) : (
                          <span className="text-gray-400">Sin archivo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(directiva.id_directiva)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredDirectivas.length} de {directivas.length} directivas
          </div>
        </CardContent>
      </Card>
    </div>
  );
}