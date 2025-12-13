import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Users, Search, Plus } from "lucide-react";

import { getTrabajadores } from "@/services/sharepointService";
import { sharePointClient } from "@/lib/sharepoint";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";

interface Trabajador {
  id: string | number;
  nombreCompleto?: string;
  rut?: string;
  email?: string;
  estado?: string;
  nacimiento?: string;
}

function calcularEdad(fecha?: string): number | null {
  if (!fecha) return null;

  const nacimiento = new Date(fecha);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

export default function TrabajadoresLista() {
  const navigate = useNavigate();

  const { canWrite } = useSharePointAuth();
  const canCreate = canWrite("rrhh");

  const [searchTerm, setSearchTerm] = useState("");
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal create
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newNombreCompleto, setNewNombreCompleto] = useState("");
  const [newRut, setNewRut] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEstado, setNewEstado] = useState("");
  const [newNacimiento, setNewNacimiento] = useState(""); // YYYY-MM-DD

  const resetCreateForm = () => {
    setNewNombreCompleto("");
    setNewRut("");
    setNewEmail("");
    setNewEstado("");
    setNewNacimiento("");
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await getTrabajadores();

      const mapped: Trabajador[] = items.map((item: any) => {
        const f = item.fields || {};
        return {
          id: item.id,
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
      setError(msg);
      setTrabajadores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = trabajadores.filter((t) => {
    const s = searchTerm.toLowerCase();
    return (
      (t.nombreCompleto ?? "").toLowerCase().includes(s) ||
      (t.rut ?? "").toLowerCase().includes(s) ||
      (t.email ?? "").toLowerCase().includes(s)
    );
  });

  const handleCreate = async () => {
    if (!canCreate) return;

    // Validaciones mínimas (conservadoras)
    if (!newNombreCompleto.trim()) {
      alert("Falta el Nombre completo.");
      return;
    }
    if (!newRut.trim()) {
      alert("Falta el RUT.");
      return;
    }

    setSaving(true);
    try {
      // Respetamos nombres de columnas SharePoint (las reales que usas)
      const fields: Record<string, unknown> = {
        NOMNRE_COMPLETO: newNombreCompleto.trim(),
        N_documento: newRut.trim(),
      };

      if (newEmail.trim()) fields.Email_Empresa = newEmail.trim();
      if (newEstado.trim()) fields.Estado = newEstado.trim();
      if (newNacimiento.trim()) fields.NACIMIENTO = newNacimiento.trim(); // YYYY-MM-DD

      await sharePointClient.createListItem("TBL_TRABAJADORES", fields);

      setOpenCreate(false);
      resetCreateForm();
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      console.error("Error creando trabajador:", err);
      alert("No se pudo crear el trabajador: " + msg);
    } finally {
      setSaving(false);
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trabajadores</h1>
          <p className="text-gray-600">
            Consulta y gestión de personal · SharePoint (TBL_TRABAJADORES)
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Trabajadores ({filtered.length})
            </CardTitle>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, RUT o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-72"
              />
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
                  <tr className="border-b text-sm">
                    <th className="text-left py-3 px-4 font-medium">
                      Nombre completo
                    </th>
                    <th className="text-left py-3 px-4 font-medium">RUT</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Fecha nacimiento
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Edad</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/trabajadores/${t.id}`)}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-3 px-4">{t.nombreCompleto || "-"}</td>
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
                        {t.nacimiento ? t.nacimiento.slice(0, 10) : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {calcularEdad(t.nacimiento) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL CREAR */}
      <Dialog open={openCreate} onOpenChange={(v) => {
        setOpenCreate(v);
        if (!v) resetCreateForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo trabajador</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nombre completo *</p>
              <Input
                value={newNombreCompleto}
                onChange={(e) => setNewNombreCompleto(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">RUT *</p>
              <Input
                value={newRut}
                onChange={(e) => setNewRut(e.target.value)}
                placeholder="Ej: 12.345.678-9"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Email empresa</p>
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="correo@empresa.cl"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Estado</p>
              <Input
                value={newEstado}
                onChange={(e) => setNewEstado(e.target.value)}
                placeholder="Activo / Inactivo / ..."
              />
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Fecha nacimiento</p>
              <Input
                type="date"
                value={newNacimiento}
                onChange={(e) => setNewNacimiento(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setOpenCreate(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Guardando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
