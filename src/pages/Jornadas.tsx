import { useEffect, useState } from 'react';
import { getPublicData, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';
import { ExportButton } from '@/components/ExportButton';
import { exportConfigs } from '@/lib/excelExport';
import { handleFileUploadResult, FileUploadResult } from '@/lib/fileUpload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Jornada = {
  id_jornada: string;
  id_trabajador: string;
  trabajador_nombre?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  horas_trabajadas: number;
  observaciones?: string;
  archivo_adjunto?: string;
  created_at: string;
};

type Trabajador = {
  id_trabajador: string;
  nombre_completo: string;
};

export default function Jornadas() {
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_trabajador: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    observaciones: '',
    archivo_adjunto: ''
  });

  useEffect(() => {
    loadJornadas();
    loadTrabajadores();
  }, []);

  const loadJornadas = async () => {
    try {
      const { data, error } = await getPublicData('app_61b67b0a14_jornadas');
      
      if (error) {
        console.error('Error loading jornadas:', error);
        toast.error('Error al cargar jornadas: ' + error);
      } else {
        setJornadas(data || []);
      }
    } catch (error) {
      console.error('Error loading jornadas:', error);
      toast.error('Error de conexión');
    }
  };

  const loadTrabajadores = async () => {
    try {
      const { data, error } = await getPublicData('tbl_trabajadores', 'id_trabajador, nombre_completo');
      
      if (error) {
        console.error('Error loading trabajadores:', error);
      } else {
        setTrabajadores(data || []);
      }
    } catch (error) {
      console.error('Error loading trabajadores:', error);
    }
  };

  const calculateHours = (inicio: string, fin: string): number => {
    if (!inicio || !fin) return 0;
    
    const startTime = new Date(`2000-01-01T${inicio}`);
    const endTime = new Date(`2000-01-01T${fin}`);
    
    if (endTime < startTime) {
      // Si la hora de fin es menor, asumimos que es del día siguiente
      endTime.setDate(endTime.getDate() + 1);
    }
    
    const diffMs = endTime.getTime() - startTime.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Redondear a 2 decimales
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const horasTrabajadas = calculateHours(formData.hora_inicio, formData.hora_fin);
    
    try {
      const { error } = await supabase
        .from('app_61b67b0a14_jornadas')
        .insert([{
          id_trabajador: formData.id_trabajador,
          fecha: formData.fecha,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          horas_trabajadas: horasTrabajadas,
          observaciones: formData.observaciones,
          archivo_adjunto: formData.archivo_adjunto
        }]);

      if (error) {
        toast.error('Error al crear jornada: ' + error.message);
      } else {
        toast.success('Jornada creada exitosamente');
        setIsDialogOpen(false);
        setFormData({
          id_trabajador: '',
          fecha: '',
          hora_inicio: '',
          hora_fin: '',
          observaciones: '',
          archivo_adjunto: ''
        });
        loadJornadas();
      }
    } catch (error) {
      toast.error('Error al crear jornada');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta jornada?')) return;
    
    try {
      const { error } = await supabase
        .from('app_61b67b0a14_jornadas')
        .delete()
        .eq('id_jornada', id);

      if (error) {
        toast.error('Error al eliminar jornada: ' + error.message);
      } else {
        toast.success('Jornada eliminada exitosamente');
        loadJornadas();
      }
    } catch (error) {
      toast.error('Error al eliminar jornada');
      console.error(error);
    }
  };

  const handleFileUploaded = (result: FileUploadResult) => {
    handleFileUploadResult(result, setFormData);
  };

  const filteredJornadas = jornadas.filter((j) => {
    const search = searchTerm.toLowerCase();
    const trabajadorNombre = trabajadores.find(t => t.id_trabajador === j.id_trabajador)?.nombre_completo || '';
    return (
      trabajadorNombre.toLowerCase().includes(search) ||
      j.fecha.includes(search) ||
      j.observaciones?.toLowerCase().includes(search)
    );
  });

  // Preparar datos para exportación con nombres de trabajadores
  const exportData = filteredJornadas.map(jornada => ({
    ...jornada,
    trabajador_nombre: trabajadores.find(t => t.id_trabajador === jornada.id_trabajador)?.nombre_completo || 'Sin asignar'
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Jornadas Laborales</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Control de horarios y jornadas de trabajo</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={exportData}
            columns={exportConfigs.jornadas.columns}
            fileName={exportConfigs.jornadas.fileName}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Jornada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Jornada</DialogTitle>
                <DialogDescription>
                  Completa los datos de la jornada laboral
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trabajador" className="text-right">Trabajador</Label>
                  <Select
                    value={formData.id_trabajador}
                    onValueChange={(value) => setFormData({...formData, id_trabajador: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar trabajador" />
                    </SelectTrigger>
                    <SelectContent>
                      {trabajadores.map((trabajador) => (
                        <SelectItem key={trabajador.id_trabajador} value={trabajador.id_trabajador}>
                          {trabajador.nombre_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fecha" className="text-right">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hora_inicio" className="text-right">Hora Inicio</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hora_fin" className="text-right">Hora Fin</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                {formData.hora_inicio && formData.hora_fin && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Horas Calculadas</Label>
                    <div className="col-span-3">
                      <Badge variant="outline">
                        {calculateHours(formData.hora_inicio, formData.hora_fin)} horas
                      </Badge>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="observaciones" className="text-right mt-2">Observaciones</Label>
                  <Input
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    className="col-span-3"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Archivo</Label>
                  <div className="col-span-3">
                    <FileUpload
                      onFileUploaded={handleFileUploaded}
                      currentFile={formData.archivo_adjunto}
                      folder="jornadas"
                      label=""
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Guardar Jornada
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Jornadas ({jornadas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por trabajador, fecha u observaciones..."
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora Inicio</TableHead>
                  <TableHead>Hora Fin</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJornadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {jornadas.length === 0 
                        ? "No hay jornadas registradas" 
                        : "No se encontraron jornadas con ese criterio de búsqueda"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJornadas.map((jornada) => (
                    <TableRow key={jornada.id_jornada}>
                      <TableCell className="font-medium">
                        {trabajadores.find(t => t.id_trabajador === jornada.id_trabajador)?.nombre_completo || 'Sin asignar'}
                      </TableCell>
                      <TableCell>{new Date(jornada.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{jornada.hora_inicio}</TableCell>
                      <TableCell>{jornada.hora_fin}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {jornada.horas_trabajadas}h
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{jornada.observaciones || '-'}</TableCell>
                      <TableCell>
                        {jornada.archivo_adjunto ? (
                          <Badge variant="outline">📎 Adjunto</Badge>
                        ) : (
                          <span className="text-gray-400">Sin archivo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(jornada.id_jornada)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredJornadas.length} de {jornadas.length} jornadas
          </div>
        </CardContent>
      </Card>
    </div>
  );
}