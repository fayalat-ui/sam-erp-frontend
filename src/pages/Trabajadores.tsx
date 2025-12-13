import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Users, Search, RefreshCw, AlertTriangle } from "lucide-react";

import { getTrabajadores } from "@/services/sharepointService";

// ✅ IMPORTA TU DETALLE (ajusta ruta si corresponde)
import TrabajadorDetalle from "./TrabajadorDetalle";

/**
 * Modelo mínimo para la LISTA
 * Respetando nombres reales de SharePoint
 */
interface Trabajador {
  id: string | number;
  nombreCompleto?: string;
  rut?: string;
  email?: string;
  estado?: string;
  nacimiento?: string;
}

/**
 * Calcula edad desde fecha de nacimiento (frontend puro)
 */
function calcularEdad(fecha?: string): number | null {
  if (!fecha) return null;
  const nacimiento = new Date(fecha);
  if (Number.isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

function formatDateISO(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().slice(0, 10);
}

/**
 * ✅ Componente interno: Lista
 * (lo dejamos dentro del mismo archivo para NO crear más archivos)
 */
function TrabajadoresLista() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") setLoading(true);
    if (mode === "refresh") setRefreshing(true);

    setError(null);

    try {
      const items = await getTrabajadores();

      const mapped: Trabajador[] = items.map((item: any) => {
        const f = item.fields || {};

        return {
          id: item.id,
          // OJO: en tu lista se llama "NOMNRE_COMPLETO" (con typo) y es calculado
          nombreCompleto: f.NOMNRE_COMPLETO,
          rut: f.N_documento,
          email: f.Email_Empresa,
          estado: f.Estado,
          nacimiento: f.NACIMIENTO,
        };
      });

      setTrabajadores(mapped);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar trabajadores";
      console.error("Error cargando trabajadores:", err);
      setError(msg);
      setTrabajadores([]);
    } finally {
      if (mode === "initial") setLoading(false);
      if (mode === "refresh") setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return trabajadores;

    return trabajadores.filter((t) => {
      return (
        (t.nombreCompleto ?? "").toLowerCase().includes(s) ||
        (t.rut ?? "").toLowerCase().includes(s) ||
        (t.email ?? "").toLowerCase().includes(s)
      );
    });
  }, [trabajadores, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
          <span>Cargando trabajadores…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trabajadores</h1>
          <p className="text-gray-600">
            Consulta de personal · SharePoint (TBL_TRABAJADORES)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadData("refresh")}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Actualizando…" : "Actualizar"}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-700 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error al cargar</p>
              <p className="text-red-800 text-sm mt-1">{error}</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadData("initial")}
                  className="bg-white"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      <Card className="shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Trabajadores
              <Badge variant="outline" className="ml-2">
                {filtered.length}
              </Badge>
            </CardTitle>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, RUT o email…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Tip: haz clic en una fila para ver el detalle y editar (si tienes
            permiso).
          </p>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay trabajadores registrados"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm
                  ? "Prueba con otro nombre, RUT o email."
                  : "Cuando existan registros, aparecerán aquí."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm">
                    <th className="text-left py-3 px-4 font-medium">
                      Nombre completo
                    </th>
                    <th className="text-left py-3 px-4 font-medium">RUT</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Nacimiento
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Edad</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((t) => {
                    const edad = calcularEdad(t.nacimiento);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/trabajadores/${t.id}`)}
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        title="Ver detalle"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {t.nombreCompleto || "-"}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-sm">
                          {t.rut || "-"}
                        </td>

                        <td className="py-3 px-4 text-sm">{t.email || "-"}</td>

                        <td className="py-3 px-4">
                          {t.estado ? (
                            <Badge variant="outline">{t.estado}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-sm">
                          {formatDateISO(t.nacimiento)}
                        </td>

                        <td className="py-3 px-4 text-sm">{edad ?? "—"}</td>
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

/**
 * ✅ Export principal: Router interno del módulo /trabajadores/*
 */
export default function Trabajadores() {
  return (
    <Routes>
      {/* /trabajadores  */}
      <Route index element={<TrabajadoresLista />} />

      {/* /trabajadores/:id */}
      <Route path=":id" element={<TrabajadorDetalle />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/trabajadores" replace />} />
    </Routes>
  );
}
