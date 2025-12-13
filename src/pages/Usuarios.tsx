import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import { sharePointClient } from "@/lib/sharepoint";
import { Shield, Save, Plus, Trash2, RefreshCw } from "lucide-react";

type Permisos = Record<string, string[]>;

const PERMS_LIST = "TBL_USUARIOS_PERMISOS";

const MODULES = [
  { key: "rrhh", label: "RRHH", spField: "PERM_RRHH" },
  { key: "administradores", label: "Administradores", spField: "PERM_ADMINISTRADORES" },
  { key: "osp", label: "OSP", spField: "PERM_OSP" },
  { key: "usuarios", label: "Usuarios", spField: "PERM_USUARIOS" },
] as const;

const LEVELS = [
  { key: "lectura", label: "Lectura" },
  { key: "escritura", label: "Escritura" },
  { key: "administracion", label: "Administración" },
] as const;

function ensureArrayStrings(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function ensurePermsShape(p?: Permisos): Permisos {
  const out: Permisos = {};
  for (const m of MODULES) out[m.key] = [];
  if (!p) return out;
  for (const m of MODULES) out[m.key] = Array.isArray(p[m.key]) ? p[m.key] : [];
  return out;
}

type PermItem = {
  itemId: string; // ID del item en lista SP
  upn: string; // fields.Title
  isSystemAdmin: boolean; // fields.USR_IS_SYSTEM_ADMIN
  perms: Permisos; // desde PERM_*
  estado?: string; // fields.USR_ESTADO
};

export default function Usuarios() {
  const { user, isSystemAdmin, reloadPermissions } = useSharePointAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<PermItem[]>([]);
  const [selectedUpn, setSelectedUpn] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const [newUpn, setNewUpn] = useState("");

  const [draftPerms, setDraftPerms] = useState<Permisos>(() => ensurePermsShape());
  const [draftIsSys, setDraftIsSys] = useState(false);

  const selected = useMemo(() => {
    const upn = selectedUpn.toLowerCase().trim();
    return items.find((x) => x.upn.toLowerCase().trim() === upn) || null;
  }, [items, selectedUpn]);

  const load = async () => {
    setLoading(true);
    try {
      const select =
        "Title,USR_IS_SYSTEM_ADMIN,USR_ESTADO,PERM_RRHH,PERM_ADMINISTRADORES,PERM_OSP,PERM_USUARIOS";
      const res = await sharePointClient.getListItems(PERMS_LIST, select, undefined, undefined, 999);

      const mapped: PermItem[] = (res || []).map((it: any) => {
        const f = it.fields || {};
        const perms: Permisos = ensurePermsShape({
          rrhh: ensureArrayStrings(f.PERM_RRHH),
          administradores: ensureArrayStrings(f.PERM_ADMINISTRADORES),
          osp: ensureArrayStrings(f.PERM_OSP),
          usuarios: ensureArrayStrings(f.PERM_USUARIOS),
        });

        return {
          itemId: String(it.id),
          upn: String(f.Title || ""),
          isSystemAdmin: Boolean(f.USR_IS_SYSTEM_ADMIN),
          estado: f.USR_ESTADO ? String(f.USR_ESTADO) : undefined,
          perms,
        };
      });

      mapped.sort((a, b) => a.upn.localeCompare(b.upn));
      setItems(mapped);

      // Mantener selección si existe
      if (selectedUpn) {
        const still = mapped.find((x) => x.upn.toLowerCase() === selectedUpn.toLowerCase());
        if (!still) {
          setSelectedUpn("");
          setSelectedItemId("");
          setDraftPerms(ensurePermsShape());
          setDraftIsSys(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSystemAdmin) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSystemAdmin]);

  useEffect(() => {
    if (!selected) return;
    setSelectedItemId(selected.itemId);
    setDraftPerms(ensurePermsShape(selected.perms));
    setDraftIsSys(Boolean(selected.isSystemAdmin));
  }, [selected]);

  const toggle = (moduleKey: string, levelKey: string) => {
    setDraftPerms((prev) => {
      const next = { ...prev };
      const set = new Set(next[moduleKey] || []);
      if (set.has(levelKey)) set.delete(levelKey);
      else set.add(levelKey);
      next[moduleKey] = Array.from(set);
      return next;
    });
  };

  const addUser = () => {
    const upn = newUpn.toLowerCase().trim();
    if (!upn) return;
    if (!upn.includes("@")) {
      alert("Ingresa un UPN válido (ej: usuario@empresa.cl).");
      return;
    }

    // Si ya existe, lo seleccionamos
    const existing = items.find((x) => x.upn.toLowerCase().trim() === upn);
    if (existing) {
      setSelectedUpn(existing.upn);
      return;
    }

    // Nueva selección “pendiente de guardar”
    setSelectedUpn(upn);
    setSelectedItemId(""); // no existe aún
    setDraftPerms(ensurePermsShape());
    setDraftIsSys(false);
    setNewUpn("");
  };

  const save = async () => {
    const upn = selectedUpn.toLowerCase().trim();
    if (!upn) {
      alert("Selecciona o agrega un usuario (UPN).");
      return;
    }

    setSaving(true);
    try {
      const fields: Record<string, unknown> = {
        Title: upn,
        USR_IS_SYSTEM_ADMIN: Boolean(draftIsSys),
      };

      // Guardamos los permisos en las columnas PERM_*
      for (const m of MODULES) {
        fields[m.spField] = draftPerms[m.key] || [];
      }

      if (selectedItemId) {
        await sharePointClient.updateListItem(PERMS_LIST, selectedItemId, fields);
      } else {
        const created: any = await sharePointClient.createListItem(PERMS_LIST, fields);
        // createListItem retorna item; su id viene arriba
        const newId = String(created?.id || "");
        setSelectedItemId(newId);
      }

      await load();

      // Si editaste tu propio UPN, recarga permisos en sesión
      const myUpn = (user?.userPrincipalName || "").toLowerCase().trim();
      if (myUpn && myUpn === upn) {
        await reloadPermissions();
      }

      alert("Permisos guardados en SharePoint.");
    } catch (e: any) {
      console.error(e);
      alert("Error guardando permisos: " + (e?.message || "desconocido"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedItemId) {
      alert("Este usuario aún no está guardado en SharePoint.");
      return;
    }

    const ok = confirm(
      `Eliminar configuración de permisos para:\n\n${selectedUpn}\n\n¿Confirmas?`
    );
    if (!ok) return;

    setSaving(true);
    try {
      await sharePointClient.deleteListItem(PERMS_LIST, selectedItemId);
      setSelectedUpn("");
      setSelectedItemId("");
      setDraftPerms(ensurePermsShape());
      setDraftIsSys(false);
      await load();
      alert("Registro eliminado.");
    } catch (e: any) {
      console.error(e);
      alert("Error eliminando: " + (e?.message || "desconocido"));
    } finally {
      setSaving(false);
    }
  };

  if (!isSystemAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administración de usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No tienes permisos para administrar usuarios.</p>
          <div className="mt-3">
            <Badge variant="outline">Acceso restringido</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-600">
          Permisos por usuario guardados en SharePoint ({PERMS_LIST})
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar usuario por UPN
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 items-center">
          <Input
            value={newUpn}
            onChange={(e) => setNewUpn(e.target.value)}
            placeholder="usuario@empresa.cl"
          />
          <Button onClick={addUser}>Agregar</Button>
          <Button variant="outline" onClick={() => load()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Recargar
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Usuarios configurados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">Aún no hay usuarios configurados.</p>
            ) : (
              items.map((u) => (
                <div
                  key={u.itemId}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedUpn.toLowerCase() === u.upn.toLowerCase()
                      ? "bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedUpn(u.upn)}
                >
                  <div className="text-sm font-medium truncate">{u.upn}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {u.isSystemAdmin && <Badge variant="outline">SYS ADMIN</Badge>}
                    {u.estado && <Badge variant="outline">{u.estado}</Badge>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Permisos</span>
              <div className="flex gap-2">
                {selectedUpn && (
                  <Button
                    variant="outline"
                    onClick={remove}
                    disabled={saving}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                )}
                <Button onClick={save} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!selectedUpn ? (
              <p className="text-gray-500">Selecciona un usuario o agrega uno por UPN.</p>
            ) : (
              <div className="space-y-6">
                <div className="text-sm">
                  <div className="text-gray-500">Editando</div>
                  <div className="font-medium">{selectedUpn}</div>
                </div>

                <div className="border rounded p-4">
                  <div className="font-semibold mb-3">Administrador del sistema</div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setDraftIsSys((v) => !v)}
                      className={`px-3 py-2 rounded border text-sm ${
                        draftIsSys ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {draftIsSys ? "Sí (SYS ADMIN)" : "No"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    SYS ADMIN puede administrar permisos y el módulo Usuarios.
                  </p>
                </div>

                {MODULES.map((m) => (
                  <div key={m.key} className="border rounded p-4">
                    <div className="font-semibold mb-3">{m.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((lvl) => {
                        const checked = (draftPerms[m.key] || []).includes(lvl.key);
                        return (
                          <button
                            key={lvl.key}
                            type="button"
                            onClick={() => toggle(m.key, lvl.key)}
                            className={`px-3 py-2 rounded border text-sm ${
                              checked ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="text-xs text-gray-500">
                  Consejo práctico: empieza con <b>lectura</b> y sube a escritura/admin solo donde corresponda.
                  Un ERP con permisos flojos es básicamente “Wikipedia con sueldos”.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tu sesión</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div><b>Nombre:</b> {user?.displayName || "-"}</div>
          <div><b>UPN:</b> {user?.userPrincipalName || "-"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
