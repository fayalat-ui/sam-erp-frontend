import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import { useSharePointData } from "@/hooks/useSharePointData";
import { serviciosService } from "@/lib/sharepoint-services";
import { SHAREPOINT_LISTS } from "@/lib/sharepoint-mappings";
import { Plus, Search, Edit, Trash2, Briefcase, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Servicio {
  id: string;
  nombre?: string;
  empresa?: string; // EMPRESA
  rut_cliente?: string; // RUT_CLIENTE
  direccion?: string; // DIRECCION
  ubicacion?: unknown; // UBICACION
  dotacion?: number; // DOTACION
  estado?: string; // ESTADO
}

type ServicioForm = {
  nombre: string;
  empresa: string;
  rut_cliente: string;
  direccion: string;
  ubicacion: string;
  dotacion: string; // lo guardamos como string y convertimos al guardar
  estado: string;
};

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function formatUbicacion(s: Servicio): string {
  if (!s) return "-";
  if (typeof s.ubicacion === "string" && s.ubicacion.trim().length > 0) return s.ubicacion;
  if (s.ubicacion && typeof s.ubicacion === "object") {
    try {
      const obj = s.ubicacion as Record<string, unknown>;
      const parts = ["calle", "ciudad", "region", "pais"]
        .map((k) => (obj[k] ? String(obj[k]) : ""))
        .filter(Boolean);
      if (parts.length) return parts.join(", ");
      return JSON.stringify(obj);
    } catch {
      return JSON.stringify(s.ubicacion);
    }
  }
  if (s.direccion && s.direccion.trim().length > 0) return s.direccion;
  return "-";
}

function toForm(s?: Servicio | null): ServicioForm {
  return {
    nombre: s?.nombre ?? "",
    empresa: s?.empresa ?? "",
    rut_cliente: s?.rut_cliente ?? "",
    direccion: s?.direccion ?? "",
    ubicacion: typeof s?.ubicacion === "string" ? s?.ubicacion : "",
    dotacion: s?.dotacion != null ? String(s.dotacion) : "",
    estado: s?.estado ?? "",
  };
}

export default function Servicios() {
  const { canWrite, canAdmin } = useSharePointAuth();

  // permisos
  const canEdit = canWrite("osp");
  const canDelete = canAdmin("osp");

  // filtros UI
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 350);

  const [filterCliente, setFilterCliente] = useState("all"); // EMPRESA
  const [filterRutCliente, setFilterRutCliente] = useState("all"); // RUT_CLIENTE
  const [filterEstado, setFilterEstado] = useState("all"); // ESTADO

  // paginación UI (optimización básica)
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);

  // data
  const { data: servicios, loading, error, refetch, remove } = useSharePointData<Servicio>(serviciosService, {
    listName: SHAREPOINT_LISTS.SERVICIOS,
    select: "ID,NOMBRE,EMPRESA,RUT_CLIENTE,UBICACION,DOTACION,ESTADO,DIRECCION",
    // 👇 Si tu hook soporta server-side, aquí es donde deberías pasar:
    // top: PAGE_SIZE,
    // skip: (page-1)*PAGE_SIZE,
    // filter: buildODataFilter(...)
    // orderby: "ID desc"
  });

  // options (si tienes muchísimos registros, ideal mover esto a server/metadata)
  const clientesOptions = useMemo(() => {
    const set = new Set<string>();
    (servicios ?? []).forEach((s) => s.empresa?.trim() && set.add(s.empresa.trim()));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [servicios]);

  const rutOptions = useMemo(() => {
    const set = new Set<string>();
    (servicios ?? []).forEach((s) => s.rut_cliente?.trim() && set.add(s.rut_cliente.trim()));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [servicios]);

  const estadosOptions = useMemo(() => {
    const set = new Set<string>();
    (servicios ?? []).forEach((s) => s.estado?.trim() && set.add(s.estado.trim()));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [servicios]);

  // filtro client-side (bien para chico/medio; para “grande”, esto debe ir al servidor)
  const filteredServicios = useMemo(() => {
    const sLower = debouncedSearch.toLowerCase();

    return (servicios ?? []).filter((srv) => {
      const matchSearch =
        (srv.nombre ?? "").toLowerCase().includes(sLower) ||
        (srv.empresa ?? "").toLowerCase().includes(sLower) ||
        formatUbicacion(srv).toLowerCase().includes(sLower);

      const matchCliente = filterCliente === "all" ? true : (srv.empresa ?? "") === filterCliente;
      const matchRut = filterRutCliente === "all" ? true : (srv.rut_cliente ?? "") === filterRutCliente;
      const matchEstado = filterEstado === "all" ? true : (srv.estado ?? "") === filterEstado;

      return matchSearch && matchCliente && matchRut && matchEstado;
    });
  }, [servicios, debouncedSearch, filterCliente, filterRutCliente, filterEstado]);

  // paginación UI
  const total = filteredServicios.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filteredServicios.slice(start, start + PAGE_SIZE);
  }, [filteredServicios, pageSafe]);

  useEffect(() => {
    // cuando cambian filtros/búsqueda, vuelve a page 1
    setPage(1);
  }, [debouncedSearch, filterCliente, filterRutCliente, filterEstado]);

  // CRUD modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServicioForm>(() => toForm(null));

  const openCreate = () => {
    setEditing(null);
    setForm(toForm(null));
    setOpen(true);
  };

  const openEdit = (s: Servicio) => {
    setEditing(s);
    setForm(toForm(s));
    setOpen(true);
  };

  const onSave = async () => {
    // validación mínima (no burocracia, pero tampoco caos)
    if (!form.nombre.trim()) return alert("Falta NOMBRE");
    if (!form.empresa.trim()) return alert("Falta EMPRESA");

const dotTrim = form.dotacion.trim();
const dotacionNum = dotTrim === "" ? null : Number(dotTrim);

if (dotTrim !== "" && !Number.isFinite(dotacionNum)) {
  alert("DOTACION debe ser numérica");
  return;
}

    // payload con columnas SharePoint (importante)
    const payload = {
      NOMBRE: form.nombre.trim(),
      EMPRESA: form.empresa.trim(),
      RUT_CLIENTE: form.rut_cliente.trim() || null,
      DIRECCION: form.direccion.trim() || null,
      UBICACION: form.ubicacion.trim() || null,
      DOTACION: dotacionNum === null ? null : dotacionNum,
      ESTADO: form.estado.trim() || null,
    };

    try {
      setSaving(true);

      // Ajusta nombres si tu serviciosService usa otros
      if (editing) {
        await (serviciosService as any).update(editing.id, payload, { listName: SHAREPOINT_LISTS.SERVICIOS });
      } else {
        await (serviciosService as any).create(payload, { listName: SHAREPOINT_LISTS.SERVICIOS });
      }

      setOpen(false);
      await refetch?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      alert("No se pudo guardar: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!remove) return;
    if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        await remove(id);
        await refetch?.();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        alert("Error al eliminar servicio: " + errorMessage);
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
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600">Gestión de servicios OSP (SharePoint: TBL_SERVICIOS)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch?.()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          {canEdit && (
            <Button onClick={openCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Servicio
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error.message}</p>
            <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Lista de Servicios ({total})
            </CardTitle>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, cliente o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Cliente (EMPRESA)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientesOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterRutCliente} onValueChange={setFilterRutCliente}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="RUT Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los RUT</SelectItem>
                  {rutOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {estadosOptions.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* paginación */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Mostrando {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Página {pageSafe} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {pageItems.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || filterCliente !== "all" || filterRutCliente !== "all" || filterEstado !== "all"
                  ? "No se encontraron servicios con ese criterio"
                  : "No hay servicios registrados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Ubicación</th>
                    <th className="text-left py-3 px-4 font-medium">Dotación</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    {(canEdit || canDelete) && <th className="text-left py-3 px-4 font-medium">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((servicio) => (
                    <tr key={servicio.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{servicio.nombre ?? "-"}</td>
                      <td className="py-3 px-4">{servicio.empresa ?? "-"}</td>
                      <td className="py-3 px-4">{formatUbicacion(servicio)}</td>
                      <td className="py-3 px-4">{servicio.dotacion ?? "-"}</td>
                      <td className="py-3 px-4">
                        {servicio.estado ? <Badge variant="outline">{servicio.estado}</Badge> : <span className="text-gray-400">-</span>}
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <Button variant="outline" size="sm" onClick={() => openEdit(servicio)} title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(servicio.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>NOMBRE</Label>
              <Input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
            </div>

            <div className="col-span-2">
              <Label>EMPRESA</Label>
              <Input value={form.empresa} onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))} />
            </div>

            <div>
              <Label>RUT_CLIENTE</Label>
              <Input value={form.rut_cliente} onChange={(e) => setForm((f) => ({ ...f, rut_cliente: e.target.value }))} />
            </div>

            <div>
              <Label>DOTACION</Label>
              <Input value={form.dotacion} onChange={(e) => setForm((f) => ({ ...f, dotacion: e.target.value }))} />
            </div>

            <div className="col-span-2">
              <Label>DIRECCION</Label>
              <Input value={form.direccion} onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))} />
            </div>

            <div className="col-span-2">
              <Label>UBICACION</Label>
              <Input value={form.ubicacion} onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value }))} />
            </div>

            <div className="col-span-2">
              <Label>ESTADO</Label>
              <Input value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={saving || !form.nombre.trim() || !form.empresa.trim()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
