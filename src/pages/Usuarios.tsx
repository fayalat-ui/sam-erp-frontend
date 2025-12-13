import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import { Shield, Save, Plus, Trash2, RefreshCw } from "lucide-react";

type Permisos = Record<string, string[]>;

const MODULES = [
  { key: "rrhh", label: "RRHH" },
  { key: "administradores", label: "Administradores" },
  { key: "osp", label: "OSP" },
  { key: "usuarios", label: "Usuarios" },
] as const;

const LEVELS = [
  { key: "lectura", label: "Lectura" },
  { key: "escritura", label: "Escritura" },
  { key: "administracion", label: "Administración" },
] as const;

function ensurePermsShape(p?: Permisos): Permisos {
  const out: Permisos = {};
  for (const m of MODULES) out[m.key] = [];
  if (!p) return out;
  for (const k of Object.keys(out)) {
    out[k] = Array.isArray(p[k]) ? (p[k] as string[]) : [];
  }
  return out;
}

export default function Usuarios() {
  const {
    user,
    isSystemAdmin,
    getStoredPermissions,
    saveStoredPermissions,
    reloadPermissions,
  } = useSharePointAuth();

  const [newUpn, setNewUpn] = useState("");
  const [selectedUpn, setSelectedUpn] = useState<string>("");

  const store = useMemo(() => getStoredPermissions(), [getStoredPermissions]);

  const allUsers = useMemo(() => {
    const keys = Object.keys(store).sort();
    return keys;
  }, [store]);

  const currentPerms = useMemo(() => {
    const upn = (selectedUpn || "").toLowerCase().trim();
    return ensurePermsShape(store[upn]);
  }, [store, selectedUpn]);

  const [draft, setDraft] = useState<Permisos>(() =>
    ensurePermsShape(store[selectedUpn])
  );

  // sincroniza draft al cambiar selectedUpn
  useMemo(() => {
    setDraft(ensurePermsShape(store[(selectedUpn || "").toLowerCase().trim()]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUpn]);

  const toggle = (moduleKey: string, levelKey: string) => {
    setDraft((prev) => {
      const next = { ...prev };
      const arr = new Set(next[moduleKey] || []);
      if (arr.has(levelKey)) arr.delete(levelKey);
      else arr.add(levelKey);
      next[moduleKey] = Array.from(arr);
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

    const nextAll = { ...store };
    if (!nextAll[upn]) {
      nextAll[upn] = ensurePermsShape();
      saveStoredPermissions(nextAll);
    }
    setSelectedUpn(upn);
    setNewUpn("");
  };

  const removeUser = (upn: string) => {
    const ok = confirm(`Eliminar configuración de permisos para:\n\n${upn}\n\n¿Confirmas?`);
    if (!ok) return;

    const nextAll = { ...store };
    delete nextAll[upn];
    saveStoredPermissions(nextAll);
    if (selectedUpn === upn) setSelectedUpn("");
  };

  const save = async () => {
    const upn = (selectedUpn || "").toLowerCase().trim();
    if (!upn) {
      alert("Selecciona un usuario.");
      return;
    }

    const nextAll = { ...store };
    nextAll[upn] = ensurePermsShape(draft);
    saveStoredPermissions(nextAll);

    // si estás editando TU propio UPN, refresca permisos altiro
    const myUpn = (user?.userPrincipalName || "").toLowerCase().trim();
    if (myUpn && myUpn === upn) {
      await reloadPermissions();
    }

    alert("Permisos guardados (temporal en este navegador).");
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
          <p className="text-gray-600">
            No tienes permisos para administrar usuarios.
          </p>
          <div className="mt-3">
            <Badge variant="outline">Acceso restringido</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-600">
          Módulo de permisos (temporal). Luego lo movemos a una lista SharePoint.
        </p>
      </div>

      {/* Alta rápida */}
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
        </CardContent>
      </Card>

      {/* Selector + permisos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Usuarios configurados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aún no hay usuarios configurados.
              </p>
            ) : (
              allUsers.map((upn) => (
                <div
                  key={upn}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedUpn === upn ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedUpn(upn)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{upn}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUser(upn);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {MODULES.map((m) => {
                      const lvls = (store[upn]?.[m.key] || []).join(", ");
                      return (
                        <Badge key={m.key} variant="outline">
                          {m.label}: {lvls || "—"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>Permisos</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => reloadPermissions()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recargar sesión
                </Button>
                <Button onClick={save} className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {!selectedUpn ? (
              <p className="text-gray-500">
                Selecciona un usuario para editar permisos.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="text-sm">
                  <div className="text-gray-500">Editando</div>
                  <div className="font-medium">{selectedUpn}</div>
                </div>

                {MODULES.map((m) => (
                  <div key={m.key} className="border rounded p-4">
                    <div className="font-semibold mb-3">{m.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((lvl) => {
                        const checked = (draft[m.key] || []).includes(lvl.key);
                        return (
                          <button
                            key={lvl.key}
                            type="button"
                            onClick={() => toggle(m.key, lvl.key)}
                            className={`px-3 py-2 rounded border text-sm ${
                              checked
                                ? "bg-gray-900 text-white"
                                : "bg-white hover:bg-gray-50"
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
                  Nota: por ahora esto se guarda en <b>este navegador</b> (localStorage).
                  Después lo pasamos a SharePoint (lista de permisos) sin cambiar la UI.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug del usuario actual */}
      <Card>
        <CardHeader>
          <CardTitle>Tu sesión</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div><b>Nombre:</b> {user?.displayName || "-"}</div>
          <div><b>UPN:</b> {user?.userPrincipalName || "-"}</div>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <Badge key={m.key} variant="outline">
                {m.label}: {(user?.permisos?.[m.key] || []).join(", ") || "—"}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
