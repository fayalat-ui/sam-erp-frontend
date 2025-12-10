import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Briefcase, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Servicio = Database['public']['Tables']['tbl_servicios']['Row'];

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_servicios')
        .select('*')
        .order('Id_servicios', { ascending: false });

      if (error) throw error;
      setServicios(data || []);
    } catch (error) {
      console.error('Error loading servicios:', error);
      toast.error('Error al cargar servicios');
    } finally {
    }
  };

  const filteredServicios = servicios.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.nombre_servicio?.toLowerCase().includes(search) ||
      s.direccion_servicio?.toLowerCase().includes(search) ||
      s.ciudad?.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string | null) => {
    if (!estado) return null;
    
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
          <h1 className="text-3xl font-bold text-slate-100">Servicios</h1>
          <p className="text-slate-400 mt-1">Gestión de servicios de seguridad</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Briefcase className="h-4 w-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Lista de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, dirección o ciudad..."
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
                  <TableHead className="text-slate-300">Nombre Servicio</TableHead>
                  <TableHead className="text-slate-300">Dirección</TableHead>
                  <TableHead className="text-slate-300">Ciudad</TableHead>
                  <TableHead className="text-slate-300">Zona</TableHead>
                  <TableHead className="text-slate-300">Guardias</TableHead>
                  <TableHead className="text-slate-300">Estado</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServicios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      No se encontraron servicios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServicios.map((servicio) => (
                    <TableRow key={servicio.Id_servicios} className="hover:bg-slate-800/50">
                      <TableCell className="text-slate-100 font-medium">
                        {servicio.nombre_servicio || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">{servicio.direccion_servicio || '-'}</TableCell>
                      <TableCell className="text-slate-300">{servicio.ciudad || '-'}</TableCell>
                      <TableCell className="text-slate-300">{servicio.zona || '-'}</TableCell>
                      <TableCell className="text-slate-300">{servicio.cantidad_guardias || 0}</TableCell>
                      <TableCell>{getEstadoBadge(servicio.estado_servicio)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            Mostrando {filteredServicios.length} de {servicios.length} servicios
          </div>
        </CardContent>
      </Card>
    </div>
  );
}