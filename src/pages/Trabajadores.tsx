import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import { getTrabajadores } from "@/services/sharepointService";
import { sharePointClient } from "@/lib/sharepoint";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";

interface Trabajador {
  id: string | number;
  title?: string;
  nombres?: string;
  apellidos?: string;
  rut?: string;
  nacimiento?: string;
  estado_civil?: string;
  celular?: string;
  correo_empresa?: string;
  telefono?: string;
  direccion?: string;
  ciudad_pais?: string;
  ciudad_estado?: string;
  ciudad_nombre?: string;
  ciudad_calle?: string;
  ciudad_cpostal?: string;
  ciudad_coordenadas?: unknown;
  cargo?: string;
  tipo_contrato?: string;
  sueldo_base?: number;
  afp?: string;
  salud?: string;
  banco?: string;
  tipo_cuenta?: string;
  numero_cuenta?: string;
  fecha_ingreso?: string;
  foto_trabajador?: string;
  doc_curso?: string;
  estado?: string;
  notas?: string;
}

export default function Trabajadores() {
  const { canWrite, canAdmin } = useSharePointAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = canWrite("rrhh");
  const canDelete = canAdmin("rrhh");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // getTrabajadores() devuelve items de Graph: { id, fields: { ... } }
      const items = await getTrabajadores();

      const mapped: Trabajador[] = items.map((item: any) => {
        const f = item.fields || {};
        return {
          id: item.id,
          title: f.Title,
          nombres: f.Nombres,
          apellidos: f.Apellidos,
          rut: f.RUT,
          nacimiento: f.Nacimiento,
          estado_civil: f.Estado_Civil,
          celular: f.Celular,
          correo_empresa: f.Correo_Empresa,
          telefono: f.Telefono,
          direccion: f.Direccion,
          ciudad_pais: f.Ciudad_Pais,
          ciudad_estado: f.Ciudad_Estado,
          ciudad_nombre: f.Ciudad_Nombre,
          ciudad_calle: f.Ciudad_Calle,
          ciudad_cpostal: f.Ciudad_CPostal,
          ciudad_coordenadas: f.Ciudad_Coordenadas,
          cargo: f.Cargo,
          tipo_contrato: f.Tipo_Contrato,
          sueldo_base:
            typeof f.Sueldo_Base === "number"
              ? (f.Sueldo_Base as number)
              : undefined,
          afp: f.AFP,
          salud: f.Salud,
          banco: f.Banco,
          tipo_cuenta: f.Tipo_Cuenta,
          numero_cuenta: f.Numero_Cuenta,
          fecha_ingreso: f.Fecha_Ingreso,
          foto_trabajador: f.FOTO_TRABAJADOR_,
          doc_curso: f.DOC_CURSO,
          estado: f.ESTADO_ || f.Estado,
          notas: f.Notas,
        };
      });

      setTrabajadores(mapped);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error desconocido al cargar datos";
      console.error("Error cargando trabajadores:", err);
      setError(msg);
      setTrabajadores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (trabajadores ?? []).filter((t) => {
    const s = searchTerm.toLowerCase();
    const nombreCompleto = `${t.nombres ?? ""} ${t.apellidos ?? ""}`.trim();
    return (
      nombreCompleto.toLowerCase().includes(s) ||
      (t.rut ?? "").toLowerCase().includes(s) ||
      (t.cargo ?? "").toLowerCase().includes(s) ||
      (t.correo_empresa ?? "").toLowerCase().includes(s)
    );
  });

  const handleCreate = async () => {
    console.log("Create trabajador");
    // Aquí más adelante podemos usar sharePointClient.createListItem("TBL_TRABAJADORES", {...})
  };

  const handleEdit = async (trabajador: Trabajador) => {
    console.log("Edit trabajador:", trabajador);
    // Aquí después podemos abrir modal / form, actualizar con updateListItem
  };

  const handleDelete = async (id: string | number) => {
    if (!canDelete) return;

    if (confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
      try {
        await sharePointClient.deleteListItem(
          "TBL_TRABAJADORES",
          String(id)
        );
        setTrabajadores((prev) =>
          prev.filter((t) => String(t.id) !== String(id))
        );
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        alert("Error al eliminar trabajador: " + errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trabajadores</h1>
          <p className="text-gray-600">
            Gestión de personal (SharePoint: TBL_TRABAJADORES)
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Trabajador
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Trabajadores ({filtered.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, RUT, cargo o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-72"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No se encontraron trabajadores"
                  : "No hay trabajadores registrados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium">RUT</th>
                    <th className="text-left py-3 px-4 font-medium">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Tipo Contrato
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Sueldo Base
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Teléfono
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(canEdit || canDelete) && (
                      <th className="text-left py-3 px-4 font-medium">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const nombreCompleto =
                      `${t.nombres ?? ""} ${t.apellidos ?? ""}`.trim() ||
                      t.title ||
                      "-";
                    return (
                      <tr
                        key={t.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{nombreCompleto}</td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {t.rut ?? "-"}
                        </td>
                        <td className="py-3 px-4">{t.cargo ?? "-"}</td>
                        <td className="py-3 px-4">
                          {t.tipo_contrato ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          {t.sueldo_base ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          {t.telefono ?? t.celular ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {t.correo_empresa ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          {t.estado ? (
                            <Badge variant="outline">{t.estado}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        {(canEdit || canDelete) && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(t)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(t.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
