import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { serviciosService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { Plus, Search, Edit, Trash2, Briefcase } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Servicio {
  id: string;
  nombre?: string;
  empresa?: string; // cliente asociado (EMPRESA)
  rut_cliente?: string;
  direccion?: string;
  ubicacion?: unknown; // puede venir como string o JSON
  dotacion?: number;
  estado?: string;
  // extras (no visibles en tabla base)
  codigo_zona?: number;
  telefono?: string;
  responsable?: string;
  fecha_inicio?: string;
  fecha_termino?: string;
  tipo_empresa?: number;
  tipo_jornada?: string;
  ciudad?: string;
  ciudad2?: string;
  pais?: string;
  activo_num?: number;
}

function formatUbicacion(s: Servicio): string {
  if (!s) return '-';
  if (typeof s.ubicacion === 'string' && s.ubicacion.trim().length > 0) return s.ubicacion;
  if (s.ubicacion && typeof s.ubicacion === 'object') {
    try {
      const obj = s.ubicacion as Record<string, unknown>;
      const parts = ['calle', 'ciudad', 'region', 'pais']
        .map((k) => (obj[k] ? String(obj[k]) : ''))
        .filter(Boolean);
      if (parts.length) return parts.join(', ');
      return JSON.stringify(obj);
    } catch {
      return JSON.stringify(s.ubicacion);
    }
  }
  if (s.direccion && s.direccion.trim().length > 0) return s.direccion;
  return '-';
}

export default function Servicios() {
  const { canWrite, canAdmin } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCliente, setFilterCliente] = useState('all'); // EMPRESA
  const [filterRutCliente, setFilterRutCliente] = useState('all'); // RUT_CLIENTE
  const [filterEstado, setFilterEstado] = useState('all'); // ESTADO

  const {
    data: servicios,
    loading,
    error,
    refetch,
    remove,
  } = useSharePointData<Servicio>(serviciosService, {
    listName: SHAREPOINT_LISTS.SERVICIOS,
    // Campos visibles y de filtrado requeridos: NOMBRE, EMPRESA, RUT_CLIENTE, UBICACION/DIRECCION, DOTACION, ESTADO
    select: 'ID,NOMBRE,EMPRESA,RUT_CLIENTE,UBICACION,DOTACION,ESTADO,DIRECCION',
  });

  const canEdit = canWrite('osp');
  const canDelete = canAdmin('osp');

  const clientesOptions = useMemo(() => {
    const set = new Set<string>();
    (servicios ?? []).forEach((s) => {
      if (s.empresa && s.empresa.trim().length > 0) set.add(s.empresa.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [servicios]);

  const rutOptions = useMemo(() => {
    const set = new Set<string>();
    (servicios ?? []).forEach((s) => {
      if (s.rut_cliente && s.rut_cliente.trim().length > 0) set.add(s.rut_cliente.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [servicios]);

  const estadosOptions = useMemo(() => {
    const set = new Set<string>();
    (servicios ?? []).forEach((s) => {
      if (s.estado && s.estado.trim().length > 0) set.add(s.estado.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [servicios]);

  const filteredServicios = useMemo(() => {
    const sLower = searchTerm.toLowerCase();
    return (servicios ?? []).filter((srv) => {
      const matchSearch =
        (srv.nombre ?? '').toLowerCase().includes(sLower) ||
        (srv.empresa ?? '').toLowerCase().includes(sLower) ||
        formatUbicacion(srv).toLowerCase().includes(sLower);

      const matchCliente = filterCliente === 'all' ? true : (srv.empresa ?? '') === filterCliente;
      const matchRut = filterRutCliente === 'all' ? true : (srv.rut_cliente ?? '') === filterRutCliente;
      const matchEstado = filterEstado === 'all' ? true : (srv.estado ?? '') === filterEstado;

      return matchSearch && matchCliente && matchRut && matchEstado;
    });
  }, [servicios, searchTerm, filterCliente, filterRutCliente, filterEstado]);

  const handleCreate = async () => {
    console.log('Create servicio');
  };

  const handleEdit = async (servicio: Servicio) => {
    console.log('Edit servicio:', servicio);
  };

  const handleDelete = async (id: string) => {
    if (!remove) return;
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      try {
        await remove(id);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        alert('Error al eliminar servicio: ' + errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600">Gestión de servicios OSP (SharePoint: TBL_SERVICIOS)</p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Servicio
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error.message}</p>
            <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Lista de Servicios ({filteredServicios.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, cliente o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Cliente (EMPRESA)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientesOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRutCliente} onValueChange={setFilterRutCliente}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="RUT Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los RUT</SelectItem>
                  {rutOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {estadosOptions.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServicios.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterCliente !== 'all' || filterRutCliente !== 'all' || filterEstado !== 'all'
                  ? 'No se encontraron servicios con ese criterio'
                  : 'No hay servicios registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Ubicación</th>
                    <th className="text-left py-3 px-4 font-medium">Dotación</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(canEdit || canDelete) && (
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredServicios.map((servicio) => (
                    <tr key={servicio.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{servicio.nombre ?? '-'}</td>
                      <td className="py-3 px-4">{servicio.empresa ?? '-'}</td>
                      <td className="py-3 px-4">{formatUbicacion(servicio)}</td>
                      <td className="py-3 px-4">{servicio.dotacion ?? '-'}</td>
                      <td className="py-3 px-4">
                        {servicio.estado ? (
                          <Badge variant="outline">{servicio.estado}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button variant="outline" size="sm" onClick={() => handleEdit(servicio)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(servicio.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}