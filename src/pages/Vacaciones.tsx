import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Vacacion = Database['public']['Tables']['tbl_vacaciones']['Row'];

export default function Vacaciones() {
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVacaciones();
  }, []);

  const loadVacaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_vacaciones')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setVacaciones(data || []);
    } catch (error) {
      console.error('Error loading vacaciones:', error);
      toast.error('Error al cargar vacaciones');
    } finally {
    }
  };

  const filteredVacaciones = vacaciones.filter((v) => {
    const search = searchTerm.toLowerCase();
    return (
      v.tipo_vacacion?.toLowerCase().includes(search) ||
      v.estado?.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string | null) => {
    if (!estado) return null;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Aprobada': 'default',
      'Pendiente': 'secondary',
      'Rechazada': 'destructive',
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
          <h1 className="text-3xl font-bold text-slate-100">Vacaciones</h1>
          <p className="text-slate-400 mt-1">Gestión de solicitudes de vacaciones</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Lista de Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por tipo o estado..."
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
                  <TableHead className="text-slate-300">ID Trabajador</TableHead>
                  <TableHead className="text-slate-300">Tipo</TableHead>
                  <TableHead className="text-slate-300">Fecha Inicio</TableHead>
                  <TableHead className="text-slate-300">Fecha Fin</TableHead>
                  <TableHead className="text-slate-300">Días Solicitados</TableHead>
                  <TableHead className="text-slate-300">Estado</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVacaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      No se encontraron solicitudes de vacaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVacaciones.map((vacacion) => (
                    <TableRow key={vacacion.id_vacacion} className="hover:bg-slate-800/50">
                      <TableCell className="text-slate-300">{vacacion.id_trabajador || '-'}</TableCell>
                      <TableCell className="text-slate-100 font-medium">
                        {vacacion.tipo_vacacion || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">{vacacion.fecha_inicio || '-'}</TableCell>
                      <TableCell className="text-slate-300">{vacacion.fecha_fin || '-'}</TableCell>
                      <TableCell className="text-slate-300">{vacacion.dias_solicitados || 0}</TableCell>
                      <TableCell>{getEstadoBadge(vacacion.estado)}</TableCell>
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
            Mostrando {filteredVacaciones.length} de {vacaciones.length} solicitudes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}