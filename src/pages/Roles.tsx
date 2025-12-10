import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole, Permission } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PermissionGuard } from '@/components/PermissionGuard';
import { MODULES, ACTIONS, MODULE_LABELS, ACTION_LABELS, Module, Action } from '@/lib/permissions';
import { useAuth } from '@/contexts/AuthContext';

interface RoleWithPermissions extends UserRole {
  permissions: Permission[];
}

interface RolPermisoRelation {
  tbl_permisos: Permission | null;
}

export default function Roles() {
  const { refreshPermissions } = useAuth();
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    selectedPermissions: [] as number[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all permissions
      const { data: permisos, error: permError } = await supabase
        .from('tbl_permisos')
        .select('*')
        .order('modulo');

      if (permError) throw permError;
      setAllPermissions(permisos || []);

      // Load roles with their permissions
      const { data: rolesData, error: rolesError } = await supabase
        .from('tbl_roles')
        .select('*')
        .order('nombre');

      if (rolesError) throw rolesError;

      const rolesWithPerms = await Promise.all(
        (rolesData || []).map(async (rol) => {
          const { data: rolPermisos } = await supabase
            .from('tbl_rol_permisos')
            .select(`
              tbl_permisos (
                id,
                modulo,
                accion,
                descripcion
              )
            `)
            .eq('rol_id', rol.id);

          const permissions = (rolPermisos as RolPermisoRelation[] || [])
            .map((rp) => rp.tbl_permisos)
            .filter((p): p is Permission => p !== null);

          return {
            ...rol,
            permissions,
          };
        })
      );

      setRoles(rolesWithPerms);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let rolId: number;

      if (editingRole) {
        // Update role
        const { error: updateError } = await supabase
          .from('tbl_roles')
          .update({
            nombre: formData.nombre,
            descripcion: formData.descripcion,
          })
          .eq('id', editingRole.id);

        if (updateError) throw updateError;
        rolId = editingRole.id;

        // Delete existing permissions
        const { error: deleteError } = await supabase
          .from('tbl_rol_permisos')
          .delete()
          .eq('rol_id', rolId);

        if (deleteError) throw deleteError;
      } else {
        // Create new role
        const { data: newRole, error: createError } = await supabase
          .from('tbl_roles')
          .insert({
            nombre: formData.nombre,
            descripcion: formData.descripcion,
          })
          .select()
          .single();

        if (createError) throw createError;
        rolId = newRole.id;
      }

      // Insert new permissions
      if (formData.selectedPermissions.length > 0) {
        const { error: insertError } = await supabase
          .from('tbl_rol_permisos')
          .insert(
            formData.selectedPermissions.map((permisoId) => ({
              rol_id: rolId,
              permiso_id: permisoId,
            }))
          );

        if (insertError) throw insertError;
      }

      toast.success(editingRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
      setDialogOpen(false);
      resetForm();
      loadData();
      await refreshPermissions();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Error al guardar rol');
    }
  };

  const handleEdit = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion || '',
      selectedPermissions: role.permissions.map((p) => p.id),
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({
      nombre: '',
      descripcion: '',
      selectedPermissions: [],
    });
  };

  const togglePermission = (permisoId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permisoId)
        ? prev.selectedPermissions.filter((id) => id !== permisoId)
        : [...prev.selectedPermissions, permisoId],
    }));
  };

  const groupPermissionsByModule = () => {
    const grouped: Record<Module, Permission[]> = {} as Record<Module, Permission[]>;
    
    allPermissions.forEach((perm) => {
      if (!grouped[perm.modulo as Module]) {
        grouped[perm.modulo as Module] = [];
      }
      grouped[perm.modulo as Module].push(perm);
    });

    return grouped;
  };


  const groupedPermissions = groupPermissionsByModule();

  return (
    <PermissionGuard modulo={MODULES.ROLES} accion={ACTIONS.VIEW}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Roles y Permisos</h1>
            <p className="text-slate-400 mt-1">Gestión de roles y permisos del sistema</p>
          </div>
          <PermissionGuard modulo={MODULES.ROLES} accion={ACTIONS.CREATE}>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Rol
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">
                    {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Define el nombre, descripción y permisos del rol
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-slate-300">Nombre del Rol</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="bg-slate-950 border-slate-700 text-slate-100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-slate-300">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="bg-slate-950 border-slate-700 text-slate-100"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-slate-300">Permisos</Label>
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([modulo, permisos]) => (
                        <div key={modulo} className="border border-slate-700 rounded-lg p-4">
                          <h3 className="text-slate-200 font-medium mb-3">
                            {MODULE_LABELS[modulo as Module]}
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {permisos.map((permiso) => (
                              <div key={permiso.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`perm-${permiso.id}`}
                                  checked={formData.selectedPermissions.includes(permiso.id)}
                                  onCheckedChange={() => togglePermission(permiso.id)}
                                />
                                <label
                                  htmlFor={`perm-${permiso.id}`}
                                  className="text-sm text-slate-300 cursor-pointer"
                                >
                                  {ACTION_LABELS[permiso.accion as Action]}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setDialogOpen(false)}
                      className="text-slate-400"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingRole ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-slate-100">{role.nombre}</CardTitle>
                  </div>
                  <PermissionGuard modulo={MODULES.ROLES} accion={ACTIONS.EDIT}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </PermissionGuard>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">{role.descripcion || 'Sin descripción'}</p>
                <div className="space-y-2">
                  <div className="text-sm text-slate-300 font-medium">
                    Permisos ({role.permissions.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 6).map((perm) => (
                      <Badge key={perm.id} variant="secondary" className="text-xs">
                        {MODULE_LABELS[perm.modulo as Module]}: {ACTION_LABELS[perm.accion as Action]}
                      </Badge>
                    ))}
                    {role.permissions.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{role.permissions.length - 6} más
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PermissionGuard>
  );
}