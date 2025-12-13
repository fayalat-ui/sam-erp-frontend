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

type Curso = {
  id: string;
  nombre: string;
  descripcion: string;
  instructor: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  participantes: number;
};

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCursos();
  }, []);

  const loadCursos = async () => {
    try {
      // Simulando datos mientras se implementa la tabla real
      setCursos([]);
      toast.info('Módulo de cursos en desarrollo');
    } catch (error) {
      console.error('Error loading cursos:', error);
      toast.error('Error de conexión');
    }
  };

  const filteredCursos = cursos.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(search) ||
      c.instructor?.toLowerCase().includes(search) ||
      c.descripcion?.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Activo': 'default',
      'Finalizado': 'secondary',
      'Cancelado': 'destructive',
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Cursos</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de cursos y capacitaciones</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cursos ({cursos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, instructor o descripción..."
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
                  <TableHead>Instructor</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Módulo de cursos en desarrollo. Próximamente disponible.
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