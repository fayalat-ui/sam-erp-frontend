import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, GraduationCap, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Curso = Database['public']['Tables']['tbl_registro_cursos_os10']['Row'];

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCursos();
  }, []);

  const loadCursos = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_registro_cursos_os10')
        .select('*')
        .order('ID_REG_CURSO_OS10', { ascending: false });

      if (error) throw error;
      setCursos(data || []);
    } catch (error) {
      console.error('Error loading cursos:', error);
      toast.error('Error al cargar cursos');
    } finally {
    }
  };

  const filteredCursos = cursos.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.CURSO_?.toLowerCase().includes(search) ||
      c.REFERENCIA?.toLowerCase().includes(search)
    );
  });

  const getVigenciaBadge = (vigencia: string | null) => {
    if (!vigencia) return null;
    
    const fechaVigencia = new Date(vigencia);
    const hoy = new Date();
    const diasRestantes = Math.floor((fechaVigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    } else if (diasRestantes <= 30) {
      return <Badge className="bg-amber-600">Por vencer</Badge>;
    } else {
      return <Badge variant="default">Vigente</Badge>;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Cursos OS10</h1>
          <p className="text-slate-400 mt-1">Registro de cursos de capacitación</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <GraduationCap className="h-4 w-4 mr-2" />
          Registrar Curso
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Lista de Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre de curso o referencia..."
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
                  <TableHead className="text-slate-300">Curso</TableHead>
                  <TableHead className="text-slate-300">Fecha Realizado</TableHead>
                  <TableHead className="text-slate-300">Vigencia</TableHead>
                  <TableHead className="text-slate-300">Referencia</TableHead>
                  <TableHead className="text-slate-300">Estado</TableHead>
                  <TableHead className="text-slate-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCursos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      No se encontraron cursos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCursos.map((curso) => (
                    <TableRow key={curso.ID_REG_CURSO_OS10} className="hover:bg-slate-800/50">
                      <TableCell className="text-slate-100 font-medium">
                        {curso.CURSO_ || '-'}
                      </TableCell>
                      <TableCell className="text-slate-300">{curso.F_REALIZADO || '-'}</TableCell>
                      <TableCell className="text-slate-300">{curso.VIGENCIA || '-'}</TableCell>
                      <TableCell className="text-slate-300">{curso.REFERENCIA || '-'}</TableCell>
                      <TableCell>{getVigenciaBadge(curso.VIGENCIA)}</TableCell>
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

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Mostrando {filteredCursos.length} de {cursos.length} cursos
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Revisa los cursos próximos a vencer</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}