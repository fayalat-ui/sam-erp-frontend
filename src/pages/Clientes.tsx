import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { clientesService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Cliente = {
  id: string;
  razon_social?: string;
  rut?: string;
  nombre_contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estado?: string;
};

export default function Clientes() {
  const { canWrite, canAdmin } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: clientes,
    loading,
    error,
    refetch,
    create,
    update,
    remove,
  } = useSharePointData<Cliente>(clientesService, {
    listName: SHAREPOINT_LISTS.CLIENTES,
    // Seleccionar columnas típicas. Ajusta si tus columnas internas difieren.
    select: 'Id,Title,RUT,NombreContacto,Email,Telefono,Direccion,Estado',
  });

  const canEdit = canWrite('administradores');
  const canDelete = canAdmin('administradores');

  const filtered = (clientes ?? []).filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      c.razon_social?.toLowerCase().includes(s) ||
      c.rut?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.nombre_contacto?.toLowerCase().includes(s)
    );
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestión de clientes (SharePoint)</p>
        </div>
        {canEdit && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Cliente
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
          <CardTitle>Lista de Clientes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <TableHead>Estado</TableHead>
                  {(canEdit || canDelete) && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {(clientes ?? []).length === 0
                        ? 'No hay clientes registrados en SharePoint'
                        : 'No se encontraron clientes con ese criterio de búsqueda'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.rut || '-'}</TableCell>
                      <TableCell className="font-medium">{c.razon_social || '-'}</TableCell>
                      <TableCell>{c.nombre_contacto || '-'}</TableCell>
                      <TableCell>{c.email || '-'}</TableCell>
                      <TableCell>{c.telefono || '-'}</TableCell>
                      <TableCell>
                        {c.estado ? (
                          <Badge variant="outline">{c.estado}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell>
                          <div className="flex gap-2">
                            {canEdit && (
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {canEdit && (
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (!remove) return;
                                  if (confirm('¿Eliminar cliente?')) {
                                    remove(c.id).catch((err: unknown) => {
                                      const msg = err instanceof Error ? err.message : String(err);
                                      alert('Error: ' + msg);
                                    });
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filtered.length} de {(clientes ?? []).length} clientes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}