import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Building, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Mandante = Database['public']['Tables']['tbl_mandantes']['Row'];

export default function Mandantes() {
  const [mandantes, setMandantes] = useState<Mandante[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMandantes();
  }, []);

  const loadMandantes = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_mandantes')
        .select('*')
        .order('Id_mandante', { ascending: false });

      if (error) throw error;
      setMandantes(data || []);
    } catch (error) {
      console.error('Error loading mandantes:', error);
      toast.error('Error al cargar mandantes');
    } finally {
    }
  };

  const filteredMandantes = mandantes.filter((m) => {
    const search = searchTerm.toLowerCase();
    return (
      m.nombre_mandante?.toLowerCase().includes(search) ||
      m.rut_mandante?.toLowerCase().includes(search) ||
      m.razon_Social_mandante?.toLowerCase().includes(search)
    );
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mandantes</h1>
          <p className="text-slate-400 mt-1">Gestión de mandantes</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Building className="h-4 w-4 mr-2" />
          Nuevo Mandante
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Lista de Mandantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, RUT o razón social..."
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
                  <TableHead className="text-slate-300">RUT</TableHead>
                  <TableHead className="text-slate-300">Nombre</TableHead>
                  <TableHead className="text-slate-300">Razón Social</TableHead>
                  <TableHead className="text-slate-300">Giro</TableHead>
                  <TableHead className="text-slate-300">Teléfono</TableHead>
                  <TableHead className="text-slate-300">Representante Legal</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMandantes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      No se encontraron mandantes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMandantes.map((mandante) => (
                    <TableRow key={mandante.Id_mandante} className="hover:bg-slate-800/50">
                      <TableCell className="text-slate-300">{mandante.rut_mandante || '-'}</TableCell>
                      <TableCell className="text-slate-100 font-medium">
                        {mandante.nombre_mandante || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">{mandante.razon_Social_mandante || '-'}</TableCell>
                      <TableCell className="text-slate-300">{mandante.Giro_mandante || '-'}</TableCell>
                      <TableCell className="text-slate-300">{mandante.telefono_mandante || '-'}</TableCell>
                      <TableCell className="text-slate-300">{mandante.representante_legal || '-'}</TableCell>
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
            Mostrando {filteredMandantes.length} de {mandantes.length} mandantes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}