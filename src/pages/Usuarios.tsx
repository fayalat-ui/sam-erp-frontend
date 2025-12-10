import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Usuario, UserRole } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';
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
import { PermissionGuard } from '@/components/PermissionGuard';
import { MODULES, ACTIONS } from '@/lib/permissions';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    rol_id: '',
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usuariosRes, rolesRes] = await Promise.all([
        supabase.from('tbl_usuarios').select('*').order('created_at', { ascending: false }),
        supabase.from('tbl_roles').select('*').order('nombre'),
      ]);

      if (usuariosRes.error) throw usuariosRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setUsuarios(usuariosRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        const { error } = await supabase
          .from('tbl_usuarios')
          .update({
            nombre: formData.nombre,
            rol_id: formData.rol_id ? parseInt(formData.rol_id) : null,
            activo: formData.activo,
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        toast.success('Usuario actualizado exitosamente');
      } else {
        // For new users, you would need to create them via Supabase Auth first
        toast.info('La creación de nuevos usuarios debe hacerse desde Supabase Auth');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar usuario');
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      email: usuario.email,
      nombre: usuario.nombre || '',
      rol_id: usuario.rol_id?.toString() || '',
      activo: usuario.activo,
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (usuario: Usuario) => {
    try {
      const { error } = await supabase
        .from('tbl_usuarios')
        .update({ activo: !usuario.activo })
        .eq('id', usuario.id);

      if (error) throw error;
      toast.success(`Usuario ${!usuario.activo ? 'activado' : 'desactivado'} exitosamente`);
      loadData();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      nombre: '',
      rol_id: '',
      activo: true,
    });
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(search) ||
      u.nombre?.toLowerCase().includes(search)
    );
  });

  const getRoleName = (rolId: number | null) => {
    if (!rolId) return 'Sin rol';
    const rol = roles.find((r) => r.id === rolId);
    return rol?.nombre || 'Desconocido';
  };


  return (
    <PermissionGuard modulo={MODULES.USUARIOS} accion={ACTIONS.VIEW}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Usuarios</h1>
            <p className="text-slate-400 mt-1">Gestión de usuarios del sistema</p>
          </div>
          <PermissionGuard modulo={MODULES.USUARIOS} accion={ACTIONS.CREATE}>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {editingUser ? 'Modifica los datos del usuario' : 'Los nuevos usuarios deben crearse desde Supabase Auth'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-950 border-slate-700 text-slate-100"
                      disabled={!!editingUser}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-slate-300">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="bg-slate-950 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol" className="text-slate-300">Rol</Label>
                    <Select
                      value={formData.rol_id}
                      onValueChange={(value) => setFormData({ ...formData, rol_id: value })}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {roles.map((rol) => (
                          <SelectItem key={rol.id} value={rol.id.toString()}>
                            {rol.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setDialogOpen(false)}
                      className="text-slate-400"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingUser ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-800 hover:bg-slate-800">
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Nombre</TableHead>
                    <TableHead className="text-slate-300">Rol</TableHead>
                    <TableHead className="text-slate-300">Estado</TableHead>
                    <TableHead className="text-slate-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <TableRow key={usuario.id} className="hover:bg-slate-800/50">
                        <TableCell className="text-slate-100 font-medium">{usuario.email}</TableCell>
                        <TableCell className="text-slate-300">{usuario.nombre || '-'}</TableCell>
                        <TableCell className="text-slate-300">{getRoleName(usuario.rol_id)}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <PermissionGuard modulo={MODULES.USUARIOS} accion={ACTIONS.EDIT}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(usuario)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard modulo={MODULES.USUARIOS} accion={ACTIONS.DELETE}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(usuario)}
                                className="text-amber-400 hover:text-amber-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-slate-400">
              Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}