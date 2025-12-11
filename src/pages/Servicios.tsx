import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { serviciosService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { Plus, Search, Edit, Trash2, Briefcase } from 'lucide-react';

interface Servicio {
  id: string;
  nombre?: string;
  empresa?: string;
  rut_cliente?: string;
  direccion?: string;
  zona?: string;
  codigo_zona?: number;
  dotacion?: number;
  telefono?: string;
  responsable?: string;
  fecha_inicio_raw?: string;
  estado?: string;
  tipo_empresa?: number;
  tipo_jornada?: string;
  ciudad?: string;
  ciudad2?: string;
  pais?: string;
  activo_num?: number;
}

export default function Servicios() {
  const { canWrite, canAdmin } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: servicios,
    loading,
    error,
    refetch,
    remove,
  } = useSharePointData<Servicio>(serviciosService, {
    listName: SHAREPOINT_LISTS.SERVICIOS,
    // Seleccionar columnas reales según TBL_SERVICIOS
    select:
      'ID,NOMBRE,RUT_CLIENTE,TIPO_EMPRESA,EMPRESA,DIRECCION,UBICACION,ZONA,DOTACION,TELEFONO,RESPONSABLE,FECHA_INICIO,ESTADO,CODIGO_ZONA,CIUDAD,TIPO_JORNADA,ACTIVO_NUM,CIUDAD2,PAIS',
  });

  const canEdit = canWrite('osp');
  const canDelete = canAdmin('osp');

  const filteredServicios = (servicios ?? []).filter((servicio) => {
    const s = searchTerm.toLowerCase();
    return (
      (servicio.nombre ?? '').toLowerCase().includes(s) ||
      (servicio.empresa ?? '').toLowerCase().includes(s) ||
      (servicio.rut_cliente ?? '').toLowerCase().includes(s) ||
      (servicio.zona ?? '').toLowerCase().includes(s) ||
      String(servicio.codigo_zona ?? '').toLowerCase().includes(s) ||
      (servicio.ciudad ?? '').toLowerCase().includes(s) ||
      (servicio.estado ?? '').toLowerCase().includes(s)
    );
  });

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Lista de Servicios ({filteredServicios.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, empresa, RUT, zona, ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServicios.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No se encontraron servicios' : 'No hay servicios registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium">RUT Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Zona</th>
                    <th className="text-left py-3 px-4 font-medium">Código Zona</th>
                    <th className="text-left py-3 px-4 font-medium">Dotación</th>
                    <th className="text-left py-3 px-4 font-medium">Teléfono</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo Jornada</th>
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
                      <td className="py-3 px-4 font-mono text-sm">{servicio.rut_cliente ?? '-'}</td>
                      <td className="py-3 px-4">{servicio.zona ?? '-'}</td>
                      <td className="py-3 px-4">{servicio.codigo_zona ?? '-'}</td>
                      <td className="py-3 px-4">{servicio.dotacion ?? '-'}</td>
                      <td className="py-3 px-4">{servicio.telefono ?? '-'}</td>
                      <td className="py-3 px-4">{servicio.tipo_jornada ?? '-'}</td>
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