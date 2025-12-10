import { useEffect, useState } from 'react';
import { getPublicData, supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Trash2, Users } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Usuario = Database['public']['Tables']['tbl_usuarios']['Row'];
type Rol = Database['public']['Tables']['tbl_roles']['Row'];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    id_rol: ''
  });

  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, []);

  const loadUsuarios = async () => {
    try {
      const { data, error } = await getPublicData('tbl_usuarios');
      
      if (error) {
        console.error('Error loading usuarios:', error);
        toast.error('Error al cargar usuarios: ' + error);
      } else {
        setUsuarios(data || []);
      }
    } catch (error) {
      console.error('Error loading usuarios:', error);
      toast.error('Error de conexión');
    }
  };

  const loadRoles = async () => {
    try {
      const { data, error } = await getPublicData('tbl_roles');
      
      if (error) {
        console.error('Error loading roles:', error);
      } else {
        setRoles(data || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Crear usuario en auth.users primero
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.nombre
          }
        }
      });

      if (authError) {
        toast.error('Error al crear usuario: ' + authError.message);
        return;
      }

      // Crear registro en tbl_usuarios
      const { error } = await supabase
        .from('tbl_usuarios')
        .insert([{
          id_auth: authData.user?.id || '',
          nombre: formData.nombre,
          email: formData.email,
          id_rol: formData.id_rol
        }]);

      if (error) {
        toast.error('Error al crear usuario: ' + error.message);
      } else {
        toast.success('Usuario creado exitosamente');
        setIsDialogOpen(false);
        setFormData({
          nombre: '',
          email: '',
          password: '',
          id_rol: ''
        });
        loadUsuarios();
      }
    } catch (error) {
      toast.error('Error al crear usuario');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      const { error } = await supabase
        .from('tbl_usuarios')
        .delete()
        .eq('id_usuario', id);

      if (error) {
        toast.error('Error al eliminar usuario: ' + error.message);
      } else {
        toast.success('Usuario eliminado exitosamente');
        loadUsuarios();
      }
    } catch (error) {
      toast.error('Error al eliminar usuario');
      console.error(error);
    }
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    );
  });

  const getRoleName = (idRol: string | null) => {
    if (!idRol) return 'Sin rol';
    const rol = roles.find(r => r.id_rol === idRol);
    return rol?.nombre || 'Rol desconocido';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Usuarios</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de usuarios del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Users className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa los datos del nuevo usuario
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="col-span-3"
                  required
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rol" className="text-right">Rol</Label>
                <Select
                  value={formData.id_rol}
                  onValueChange={(value) => setFormData({...formData, id_rol: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((rol) => (
                      <SelectItem key={rol.id_rol} value={rol.id_rol}>
                        {rol.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Guardar Usuario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({usuarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o email..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {usuarios.length === 0 
                        ? "No hay usuarios registrados" 
                        : "No se encontraron usuarios con ese criterio de búsqueda"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id_usuario}>
                      <TableCell className="font-medium">{usuario.nombre}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRoleName(usuario.id_rol)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString() : '-'}
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
                            onClick={() => handleDelete(usuario.id_usuario)}
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
            Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
          </div>
        </CardContent>
      </Card>
    </div>
  );
}