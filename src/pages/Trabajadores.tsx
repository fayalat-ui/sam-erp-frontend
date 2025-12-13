import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Users,
  Search,
  RefreshCw,
  AlertTriangle,
  Plus,
  Save,
  X,
} from "lucide-react";

import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import { getTrabajadores, createTrabajador } from "@/services/sharepointService";

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
 * Form mínimo para CREAR (conservador)
 * No tocamos columnas raras ni inventamos cosas.
 */
interface TrabajadorCreateForm {
  Nombres: string;
  Apellidos: string;
  N_documento: string;
  Email_Empresa: string;
  Estado: string;
  NACIMIENTO: string; // YYYY-MM-DD
}

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

function emptyCreateForm(): TrabajadorCreateForm {
  return {
    Nombres: "",
    Apellidos: "",
    N_documento: "",
    Email_Empresa: "",
    Estado: "",
    NACIMIENTO: "",
  };
}

/**
 * ✅ Componente interno: Lista + Crear
 */
function TrabajadoresLista() {
  const navigate = useNavigate();
  const { canWrite } = useSharePointAuth();
  const canCreate = canWrite("rrhh");

  const [searchTerm, setSearchTerm] = useState("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modal crear
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<TrabajadorCreateForm>(emptyCreateForm());

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

  const openNew = () => {
    if (!canCreate) return;
    setCreateError(null);
    setForm(emptyCreateForm());
    setOpenCreate(true);
  };

  const closeNew = () => {
    if (creating) return;
    setOpenCreate(false);
    setCreateError(null);
  };

  const onFormChange = (k: keyof TrabajadorCreateForm, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const validateCreate = () => {
    const nombres = form.Nombres.trim();
    const apellidos = form.Apellidos.trim();
    const rut = form.N_documento.trim();
    const email = form.Email_Empresa.trim();

    // Regla conservadora: al menos (Nombre o Apellido) o RUT.
    if (!nombres && !apellidos && !rut) {
      return "Debes ingresar al menos Nombre/Apellido o RUT.";
    }

    // Email (si viene) que tenga pinta de email
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return "Email empresa no parece válido.";
    }

    // NACIMIENTO: si viene, debe ser YYYY-MM-DD
    if (form.NACIMIENTO && !/^\d{4}-\d{2}-\d{2}$/.test(form.NACIMIENTO)) {
      return "Fecha de nacimiento debe ser YYYY-MM-DD.";
    }

    return null;
  };

  const submitCreate = async () => {
    if (!canCreate) return;

    const v = validateCreate();
    if (v) {
      setCreateError(v);
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const created = await createTrabajador({
        Nombres: form.Nombres.trim() || undefined,
        Apellidos: form.Apellidos.trim() || undefined,
        N_documento: form.N_documento.trim() || undefined,
        Email_Empresa: form.Email_Empresa.trim() || undefined,
        Estado: form.Estado.trim() || undefined,
        NACIMIENTO: form.NACIMIENTO || undefined,
      });

      // Actualiza lista para que aparezca
      await loadData("refresh");

      // Cierra modal y navega a detalle del nuevo
      setOpenCreate(false);

      const newId = (created as any)?.id;
      if (newId) {
        navigate(`/trabajadores/${newId}`);
      } else {
        // Si Graph no devuelve id por algún motivo, al menos deja la lista actualizada
        alert("Creado, pero no pude obtener el ID. Revisa en la lista.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error desconocido al crear";
      console.error("Error creando trabajador:", err);
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

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

        <div className="flex flex-wrap gap-2">
          {canCreate && (
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo trabajador
            </Button>
          )}

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

      {/* Error carga */}
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

      {/* ===== MODAL CREAR (simple, sin dependencias raras) ===== */}
      {openCreate && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeNew}
          />

          {/* modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Nuevo trabajador</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Crea el registro mínimo. El resto lo completas en el detalle.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeNew}
                    disabled={creating}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cerrar
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div>{createError}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nombres</p>
                    <Input
                      value={form.Nombres}
                      onChange={(e) => onFormChange("Nombres", e.target.value)}
                      placeholder="Ej: Juan"
                      disabled={creating}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Apellidos</p>
                    <Input
                      value={form.Apellidos}
                      onChange={(e) => onFormChange("Apellidos", e.target.value)}
                      placeholder="Ej: Pérez"
                      disabled={creating}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">RUT (N_documento)</p>
                    <Input
                      value={form.N_documento}
                      onChange={(e) => onFormChange("N_documento", e.target.value)}
                      placeholder="Ej: 12.345.678-9"
                      disabled={creating}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email empresa</p>
                    <Input
                      value={form.Email_Empresa}
                      onChange={(e) => onFormChange("Email_Empresa", e.target.value)}
                      placeholder="Ej: nombre@empresa.cl"
                      disabled={creating}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estado</p>
                    <Input
                      value={form.Estado}
                      onChange={(e) => onFormChange("Estado", e.target.value)}
                      placeholder="Ej: Activo"
                      disabled={creating}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nacimiento</p>
                    <Input
                      type="date"
                      value={form.NACIMIENTO}
                      onChange={(e) => onFormChange("NACIMIENTO", e.target.value)}
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={closeNew}
                    disabled={creating}
                  >
                    Cancelar
                  </Button>

                  <Button
                    onClick={submitCreate}
                    disabled={creating}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {creating ? "Creando…" : "Crear trabajador"}
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Nota: SharePoint puede exigir campos obligatorios según configuración.
                  Si te rechaza, el error te dirá cuál falta (y lo incorporamos).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ✅ Export principal: Router interno del módulo /trabajadores/*
 */
export default function Trabajadores() {
  return (
    <Routes>
      <Route index element={<TrabajadoresLista />} />
      <Route path=":id" element={<TrabajadorDetalle />} />
      <Route path="*" element={<Navigate to="/trabajadores" replace />} />
    </Routes>
  );
}
