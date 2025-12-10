import { useEffect, useState } from 'react';
import { getPublicData } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Cliente = Database['public']['Tables']['tbl_clientes']['Row'];

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
    } finally {
    }
  };

  const filteredClientes = clientes.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.razon_social?.toLowerCase().includes(search) ||
      c.RUT?.toLowerCase().includes(search) ||
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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
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
                placeholder="Buscar por razón social, RUT o contacto..."
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
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {clientes.length === 0 
                        ? "No hay clientes registrados en la base de datos" 
                        : "No se encontraron clientes con ese criterio de búsqueda"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.Id_clientes}>
                      <TableCell>{cliente.RUT || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {cliente.razon_social || '-'}
                      </TableCell>
                      <TableCell>{cliente.nombre_contacto || '-'}</TableCell>
                      <TableCell>{cliente.correo_electronico || '-'}</TableCell>
                      <TableCell>{cliente.telefono || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
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