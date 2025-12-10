import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Contrato = Database['public']['Tables']['tbl_solicitud_contratos']['Row'];

export default function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContratos();
  }, []);

  const loadContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_solicitud_contratos')
        .select('*')
        .order('Id_contrato', { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (error) {
      console.error('Error loading contratos:', error);
      toast.error('Error al cargar contratos');
    } finally {
    }
  };

  const filteredContratos = contratos.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.SOLICITANTE_?.toLowerCase().includes(search) ||
      c.jornada?.toLowerCase().includes(search) ||
      c.tipo?.toLowerCase().includes(search)
    );
  });

  const getEstadoBadge = (estado: string | null) => {
    if (!estado) return null;
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Vigente': 'default',
      'Pendiente': 'secondary',
      'Vencido': 'destructive',
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
          <h1 className="text-3xl font-bold text-slate-100">Contratos</h1>
          <p className="text-slate-400 mt-1">Gestión de contratos laborales</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Lista de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por solicitante, jornada o tipo..."
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
                  <TableHead className="text-slate-300">ID</TableHead>
                  <TableHead className="text-slate-300">Solicitante</TableHead>
                  <TableHead className="text-slate-300">Tipo</TableHead>
                  <TableHead className="text-slate-300">Jornada</TableHead>
                  <TableHead className="text-slate-300">Fecha Inicio</TableHead>
                  <TableHead className="text-slate-300">Vigencia</TableHead>
                  <TableHead className="text-slate-300">Estado</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      No se encontraron contratos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContratos.map((contrato) => (
                    <TableRow key={contrato.Id_contrato} className="hover:bg-slate-800/50">
                      <TableCell className="text-slate-300">{contrato.Id_contrato}</TableCell>
                      <TableCell className="text-slate-100 font-medium">
                        {contrato.SOLICITANTE_ || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">{contrato.tipo || '-'}</TableCell>
                      <TableCell className="text-slate-300">{contrato.jornada || '-'}</TableCell>
                      <TableCell className="text-slate-300">{contrato.FECHA_INICIO || '-'}</TableCell>
                      <TableCell className="text-slate-300">{contrato.fecha_vigencia || '-'}</TableCell>
                      <TableCell>{getEstadoBadge(contrato.estado)}</TableCell>
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
            Mostrando {filteredContratos.length} de {contratos.length} contratos
          </div>
        </CardContent>
      </Card>
    </div>
  );
}