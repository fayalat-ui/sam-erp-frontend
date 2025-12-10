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

type Contrato = {
  id: string;
  numero: string;
  cliente: string;
  servicio: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  valor: number;
};

export default function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContratos();
  }, []);

  const loadContratos = async () => {
    try {
      // Simulando datos mientras se implementa la tabla real
      setContratos([]);
      toast.info('Módulo de contratos en desarrollo');
    } catch (error) {
      console.error('Error loading contratos:', error);
      toast.error('Error de conexión');
    }
  };

  const filteredContratos = contratos.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.numero?.toLowerCase().includes(search) ||
      c.cliente?.toLowerCase().includes(search) ||
      c.servicio?.toLowerCase().includes(search)
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Contratos</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestión de contratos de servicios</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos ({contratos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por número, cliente o servicio..."
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
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Módulo de contratos en desarrollo. Próximamente disponible.
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