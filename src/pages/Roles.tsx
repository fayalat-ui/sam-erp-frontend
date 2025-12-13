import { useEffect, useState } from 'react';
import { getPublicData, supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';

type Rol = Database['public']['Tables']['tbl_roles']['Row'];

export default function Roles() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const { data, error } = await getPublicData('tbl_roles');
      
      if (error) {
        console.error('Error loading roles:', error);
        toast.error('Error al cargar roles: ' + error);
      } else {
        setRoles(data || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error de conexión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('tbl_roles')
        .insert([{
          nombre: formData.nombre,
          descripcion: formData.descripcion
        }]);

      if (error) {
        toast.error('Error al crear rol: ' + error.message);
      } else {
        toast.success('Rol creado exitosamente');
        setIsDialogOpen(false);
        setFormData({
          nombre: '',
          descripcion: ''
        });
        loadRoles();
      }
    } catch (error) {
      toast.error('Error al crear rol');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este rol?')) return;
    
    try {
      const { error } = await supabase
        .from('tbl_roles')
        .delete()
        .eq('id_rol', id);

      if (error) {
        toast.error('Error al eliminar rol: ' + error.message);
      } else {
        toast.success('Rol eliminado exitosamente');
        loadRoles();
      }
    } catch (error) {
      toast.error('Error al eliminar rol');
      console.error(error);
    }
  };

  const filteredRoles = roles.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.nombre?.toLowerCase().includes(search) ||
      r.descripcion?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Roles</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de roles y permisos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Rol</DialogTitle>
              <DialogDescription>
                Completa los datos del nuevo rol
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
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
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Guardar Rol
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Roles ({roles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o descripción..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {roles.length === 0 
                        ? "No hay roles registrados" 
                        : "No se encontraron roles con ese criterio de búsqueda"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((rol) => (
                    <TableRow key={rol.id_rol}>
                      <TableCell className="font-medium">{rol.nombre}</TableCell>
                      <TableCell className="max-w-xs truncate">{rol.descripcion || '-'}</TableCell>
                      <TableCell>
                        {rol.created_at ? new Date(rol.created_at).toLocaleDateString() : '-'}
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
                            onClick={() => handleDelete(rol.id_rol)}
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
            Mostrando {filteredRoles.length} de {roles.length} roles
          </div>
        </CardContent>
      </Card>
    </div>
  );
}