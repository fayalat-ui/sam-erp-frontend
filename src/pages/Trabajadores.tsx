import { useEffect, useState } from 'react';
import { getPublicData, supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
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

type Trabajador = Database['public']['Tables']['tbl_trabajadores']['Row'];

export default function Trabajadores() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellidos: '',
    nombre_completo: '',
    email_personal: '',
    celular: '',
    rol: '',
    estado: 'Activo',
    archivo_adjunto: ''
  });

  useEffect(() => {
    loadTrabajadores();
  }, []);

  const loadTrabajadores = async () => {
    try {
      const { data, error } = await getPublicData('tbl_trabajadores');
      
      if (error) {
        console.error('Error loading trabajadores:', error);
        toast.error('Error al cargar trabajadores: ' + error);
      } else {
        setTrabajadores(data || []);
        if (data && data.length === 0) {
          toast.info('No hay trabajadores registrados');
        }
      }
    } catch (error) {
      console.error('Error loading trabajadores:', error);
      toast.error('Error de conexión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('tbl_trabajadores')
        .insert([{
          rut: formData.rut,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          nombre_completo: `${formData.nombres} ${formData.apellidos}`,
          email_personal: formData.email_personal,
          celular: formData.celular,
          rol: formData.rol,
          estado: formData.estado,
          archivo_adjunto: formData.archivo_adjunto
        }]);

      if (error) {
        toast.error('Error al crear trabajador: ' + error.message);
      } else {
        toast.success('Trabajador creado exitosamente');
        setIsDialogOpen(false);
        setFormData({
          rut: '',
          nombres: '',
          apellidos: '',
          nombre_completo: '',
          email_personal: '',
          celular: '',
          rol: '',
          estado: 'Activo',
          archivo_adjunto: ''
        });
        loadTrabajadores();
      }
    } catch (error) {
      toast.error('Error al crear trabajador');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este trabajador?')) return;
    
    try {
      const { error } = await supabase
        .from('tbl_trabajadores')
        .delete()
        .eq('id_trabajador', id);

      if (error) {
        toast.error('Error al eliminar trabajador: ' + error.message);
      } else {
        toast.success('Trabajador eliminado exitosamente');
        loadTrabajadores();
      }
    } catch (error) {
      toast.error('Error al eliminar trabajador');
      console.error(error);
    }
  };

  const handleFileUploaded = (result: FileUploadResult) => {
    handleFileUploadResult(result, setFormData);
  };

  const filteredTrabajadores = trabajadores.filter((t) => {
    const search = searchTerm.toLowerCase();
    return (
      t.nombre_completo?.toLowerCase().includes(search) ||
      t.rut?.toLowerCase().includes(search) ||
      t.email_personal?.toLowerCase().includes(search) ||
      `${t.nombres} ${t.apellidos}`.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string | null) => {
    if (!estado) return <Badge variant="secondary">Sin estado</Badge>;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Activo': 'default',
      'Inactivo': 'secondary',
      'Suspendido': 'destructive',
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Trabajadores</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de personal</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredTrabajadores}
            columns={exportConfigs.trabajadores.columns}
            fileName={exportConfigs.trabajadores.fileName}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Trabajador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Trabajador</DialogTitle>
                <DialogDescription>
                  Completa los datos del nuevo trabajador
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rut" className="text-right">RUT</Label>
                  <Input
                    id="rut"
                    value={formData.rut}
                    onChange={(e) => setFormData({...formData, rut: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombres" className="text-right">Nombres</Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apellidos" className="text-right">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email_personal}
                    onChange={(e) => setFormData({...formData, email_personal: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="celular" className="text-right">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => setFormData({...formData, celular: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rol" className="text-right">Rol</Label>
                  <Input
                    id="rol"
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Archivo</Label>
                  <div className="col-span-3">
                    <FileUpload
                      onFileUploaded={handleFileUploaded}
                      currentFile={formData.archivo_adjunto}
                      folder="trabajadores"
                      label=""
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Guardar Trabajador
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Trabajadores ({trabajadores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, RUT o correo..."
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
                  <TableHead>RUT</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrabajadores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {trabajadores.length === 0 
                        ? "No hay trabajadores registrados en la base de datos" 
                        : "No se encontraron trabajadores con ese criterio de búsqueda"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrabajadores.map((trabajador) => (
                    <TableRow key={trabajador.id_trabajador}>
                      <TableCell>{trabajador.rut || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {trabajador.nombre_completo || `${trabajador.nombres || ''} ${trabajador.apellidos || ''}`.trim() || '-'}
                      </TableCell>
                      <TableCell>{trabajador.rol || '-'}</TableCell>
                      <TableCell>{trabajador.email_personal || '-'}</TableCell>
                      <TableCell>{trabajador.celular || '-'}</TableCell>
                      <TableCell>{getEstadoBadge(trabajador.estado)}</TableCell>
                      <TableCell>
                        {trabajador.archivo_adjunto ? (
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
                            onClick={() => handleDelete(trabajador.id_trabajador)}
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
            Mostrando {filteredTrabajadores.length} de {trabajadores.length} trabajadores
          </div>
        </CardContent>
      </Card>
    </div>
  );
}