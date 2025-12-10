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

type Mandante = {
  id: string;
  rut: string;
  razon_social: string;
  nombre_contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: string;
};

export default function Mandantes() {
  const [mandantes, setMandantes] = useState<Mandante[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMandantes();
  }, []);

  const loadMandantes = async () => {
    try {
      // Simulando datos mientras se implementa la tabla real
      setMandantes([]);
      toast.info('Módulo de mandantes en desarrollo');
    } catch (error) {
      console.error('Error loading mandantes:', error);
      toast.error('Error de conexión');
    }
  };

  const filteredMandantes = mandantes.filter((m) => {
    const search = searchTerm.toLowerCase();
    return (
      m.razon_social?.toLowerCase().includes(search) ||
      m.rut?.toLowerCase().includes(search) ||
      m.email?.toLowerCase().includes(search) ||
      m.nombre_contacto?.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string) => {
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Mandantes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de empresas mandantes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Mandante
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mandantes ({mandantes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Módulo de mandantes en desarrollo. Próximamente disponible.
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