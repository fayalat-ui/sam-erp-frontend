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

type Cliente = Database['public']['Tables']['tbl_clientes']['Row'];

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    rut: '',
    razon_social: '',
    nombre_contacto: '',
    email: '',
    telefono: '',
    direccion: '',
    archivo_adjunto: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await getPublicData('tbl_clientes');
      
      if (error) {
        console.error('Error loading clientes:', error);
        toast.error('Error al cargar clientes: ' + error);
      } else {
        setClientes(data || []);
        if (data && data.length === 0) {
          toast.info('No hay clientes registrados');
        }
      }
    } catch (error) {
      console.error('Error loading clientes:', error);
      toast.error('Error de conexión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('tbl_clientes')
        .insert([{
          rut: formData.rut,
          razon_social: formData.razon_social,
          nombre_contacto: formData.nombre_contacto,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          archivo_adjunto: formData.archivo_adjunto
        }]);

      if (error) {
        toast.error('Error al crear cliente: ' + error.message);
      } else {
        toast.success('Cliente creado exitosamente');
        setIsDialogOpen(false);
        setFormData({
          rut: '',
          razon_social: '',
          nombre_contacto: '',
          email: '',
          telefono: '',
          direccion: '',
          archivo_adjunto: ''
        });
        loadClientes();
      }
    } catch (error) {
      toast.error('Error al crear cliente');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      const { error } = await supabase
        .from('tbl_clientes')
        .delete()
        .eq('id_cliente', id);

      if (error) {
        toast.error('Error al eliminar cliente: ' + error.message);
      } else {
        toast.success('Cliente eliminado exitosamente');
        loadClientes();
      }
    } catch (error) {
      toast.error('Error al eliminar cliente');
      console.error(error);
    }
  };

  const handleFileUploaded = (result: FileUploadResult) => {
    handleFileUploadResult(result, setFormData);
  };

  const filteredClientes = clientes.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.razon_social?.toLowerCase().includes(search) ||
      c.rut?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.nombre_contacto?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Clientes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de clientes</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredClientes}
            columns={exportConfigs.clientes.columns}
            fileName={exportConfigs.clientes.fileName}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Completa los datos del nuevo cliente
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
                  <Label htmlFor="razon_social" className="text-right">Razón Social</Label>
                  <Input
                    id="razon_social"
                    value={formData.razon_social}
                    onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre_contacto" className="text-right">Contacto</Label>
                  <Input
                    id="nombre_contacto"
                    value={formData.nombre_contacto}
                    onChange={(e) => setFormData({...formData, nombre_contacto: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefono" className="text-right">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="direccion" className="text-right">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Archivo</Label>
                  <div className="col-span-3">
                    <FileUpload
                      onFileUploaded={handleFileUploaded}
                      currentFile={formData.archivo_adjunto}
                      folder="clientes"
                      label=""
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Guardar Cliente
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({clientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por razón social, RUT, contacto o email..."
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
                  <TableHead>Razón Social</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {clientes.length === 0 
                        ? "No hay clientes registrados en la base de datos" 
                        : "No se encontraron clientes con ese criterio de búsqueda"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id_cliente}>
                      <TableCell>{cliente.rut || '-'}</TableCell>
                      <TableCell className="font-medium">{cliente.razon_social || '-'}</TableCell>
                      <TableCell>{cliente.nombre_contacto || '-'}</TableCell>
                      <TableCell>{cliente.email || '-'}</TableCell>
                      <TableCell>{cliente.telefono || '-'}</TableCell>
                      <TableCell>
                        {cliente.archivo_adjunto ? (
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
                            onClick={() => handleDelete(cliente.id_cliente)}
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
            Mostrando {filteredClientes.length} de {clientes.length} clientes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}