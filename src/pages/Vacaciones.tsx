import { useEffect, useState } from 'react';
import { getPublicData } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Vacacion = {
  id: string;
  trabajador: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_solicitados: number;
  estado: string;
  observaciones: string;
};

export default function Vacaciones() {
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVacaciones();
  }, []);

  const loadVacaciones = async () => {
    try {
      // Simulando datos mientras se implementa la tabla real
      setVacaciones([]);
      toast.info('Módulo de vacaciones en desarrollo');
    } catch (error) {
      console.error('Error loading vacaciones:', error);
      toast.error('Error de conexión');
    }
  };

  const filteredVacaciones = vacaciones.filter((v) => {
    const search = searchTerm.toLowerCase();
    return (
      v.trabajador?.toLowerCase().includes(search) ||
      v.estado?.toLowerCase().includes(search) ||
      v.observaciones?.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string) => {
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Vacaciones</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de solicitudes de vacaciones</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitudes ({vacaciones.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por trabajador, estado u observaciones..."
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
                  <TableHead>Trabajador</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Módulo de vacaciones en desarrollo. Próximamente disponible.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}