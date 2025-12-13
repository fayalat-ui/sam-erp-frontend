import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ArrowLeft,
  User,
  Mail,
  AlertTriangle,
  Briefcase,
  CreditCard,
  Edit3,
  Save,
  XCircle,
} from "lucide-react";

import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import { getTrabajadorById } from "@/services/sharepointService";
import { sharePointClient } from "@/lib/sharepoint";

interface TrabajadorDetalleData {
  id: string | number;

  // Identidad
  NOMNRE_COMPLETO?: string;
  Nombres?: string;
  Apellidos?: string;
  N_documento?: string;
  T_documento?: string;
  NACIMIENTO?: string;
  Nacionalidad?: string;
  GENERO?: string;
  Estado_civil?: string;

  // Contacto
  Email_Empresa?: string;
  Email_PERSONAL?: string;
  Celular?: string;
  DIRECCION_ANTIGUA?: string;
  Ciudad?: string;

  // Emergencia
  Contacto_Emergencia?: string;
  Telefono_Emergencia?: string;

  // Laboral
  Estado?: string;
  ROL?: string;
  Profesion?: string;
  Nivel_educativo?: string;
  Inscripcion_militar?: string;

  // Pago
  BANCO_PAGO?: string;
  TIPO_CUENTA_PAGO?: string;
  NUMERO_CUENTA_PAGO?: string;
  TITULAR_CUENTA_PAGO?: string;

  // Otros
  Notas?: string;
}

function formatFecha(fecha?: string) {
  if (!fecha) return "-";
  return fecha.slice(0, 10);
}

function toIsoDateInput(value?: string) {
  if (!value) return "";
  // si viene ISO completo, dejamos YYYY-MM-DD
  return value.slice(0, 10);
}

export default function TrabajadorDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { canWrite } = useSharePointAuth();
  const canEdit = canWrite("rrhh");

  const [data, setData] = useState<TrabajadorDetalleData | null>(null);
  const [form, setForm] = useState<TrabajadorDetalleData | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spCanUpdate = useMemo(() => {
    return typeof (sharePointClient as any)?.updateListItem === "function";
  }, []);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const item = await getTrabajadorById(id);
      const f = item.fields || {};

      const normalized: TrabajadorDetalleData = {
        id: item.id,
        ...f,
      };

      setData(normalized);
      setForm(normalized);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar trabajador";
      console.error("Error cargando trabajador:", err);
      setError(msg);
      setData(null);
      setForm(null);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (field: keyof TrabajadorDetalleData, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const startEdit = () => {
    if (!canEdit) return;
    setForm(data);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(data);
    setIsEditing(false);
  };

  const save = async () => {
    if (!canEdit) return;
    if (!data || !form) return;

    if (!spCanUpdate) {
      alert(
        "No se encontró updateListItem en sharePointClient. La ficha se puede ver, pero falta habilitar actualización en el cliente."
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Construimos un PATCH seguro: solo campos que usamos / editamos
      // (y respetando nombres de SharePoint)
      const payload: Record<string, any> = {
        Nombres: form.Nombres ?? "",
        Apellidos: form.Apellidos ?? "",
        N_documento: form.N_documento ?? "",
        Email_Empresa: form.Email_Empresa ?? "",
        Email_PERSONAL: form.Email_PERSONAL ?? "",
        Celular: form.Celular ?? "",
        DIRECCION_ANTIGUA: form.DIRECCION_ANTIGUA ?? "",
        Ciudad: form.Ciudad ?? "",
        Contacto_Emergencia: form.Contacto_Emergencia ?? "",
        Telefono_Emergencia: form.Telefono_Emergencia ?? "",
        Estado: form.Estado ?? "",
        ROL: form.ROL ?? "",
        Profesion: form.Profesion ?? "",
        BANCO_PAGO: form.BANCO_PAGO ?? "",
        TIPO_CUENTA_PAGO: form.TIPO_CUENTA_PAGO ?? "",
        NUMERO_CUENTA_PAGO: form.NUMERO_CUENTA_PAGO ?? "",
        TITULAR_CUENTA_PAGO: form.TITULAR_CUENTA_PAGO ?? "",
        Notas: form.Notas ?? "",
      };

      // Fecha NACIMIENTO: enviar en formato YYYY-MM-DD si existe
      if (form.NACIMIENTO) payload.NACIMIENTO = form.NACIMIENTO;

      await (sharePointClient as any).updateListItem(
        "TBL_TRABAJADORES",
        String(data.id),
        payload
      );

      // Recargar desde SP para quedar 100% sincronizados
      await loadData();
      setIsEditing(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error desconocido al guardar";
      console.error("Error guardando trabajador:", err);
      setError(msg);
      alert("No se pudo guardar: " + msg);
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

  if (error || !data || !form) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-800">
            {error || "No se pudo cargar el trabajador"}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" onClick={() => navigate("/trabajadores")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button onClick={loadData}>Reintentar</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Volver */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/trabajadores")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Trabajadores
        </Button>

        <div className="flex items-center gap-2">
          {!isEditing && canEdit && (
            <Button onClick={startEdit} className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Editar
            </Button>
          )}

          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {data.NOMNRE_COMPLETO || "Trabajador"}
        </h1>
        <div className="mt-1">
          {data.Estado ? (
            <Badge variant="outline">{data.Estado}</Badge>
          ) : (
            <Badge variant="secondary">Sin estado</Badge>
          )}
        </div>

        {!spCanUpdate && canEdit && (
          <p className="mt-2 text-sm text-amber-700">
            Nota: falta implementar <b>updateListItem</b> en sharePointClient para
            guardar cambios.
          </p>
        )}
      </div>

      {/* DATOS PERSONALES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos personales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Nombres</p>
            {isEditing ? (
              <Input
                value={form.Nombres ?? ""}
                onChange={(e) => onChange("Nombres", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Nombres || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Apellidos</p>
            {isEditing ? (
              <Input
                value={form.Apellidos ?? ""}
                onChange={(e) => onChange("Apellidos", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Apellidos || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Documento</p>
            {isEditing ? (
              <Input
                value={form.N_documento ?? ""}
                onChange={(e) => onChange("N_documento", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.N_documento || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Tipo documento</p>
            <p className="font-medium">{data.T_documento || "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Nacimiento</p>
            {isEditing ? (
              <Input
                type="date"
                value={toIsoDateInput(form.NACIMIENTO)}
                onChange={(e) => onChange("NACIMIENTO", e.target.value)}
              />
            ) : (
              <p className="font-medium">{formatFecha(data.NACIMIENTO)}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Nacionalidad</p>
            <p className="font-medium">{data.Nacionalidad || "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Género</p>
            <p className="font-medium">{data.GENERO || "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Estado civil</p>
            <p className="font-medium">{data.Estado_civil || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* CONTACTO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Email empresa</p>
            {isEditing ? (
              <Input
                value={form.Email_Empresa ?? ""}
                onChange={(e) => onChange("Email_Empresa", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Email_Empresa || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Email personal</p>
            {isEditing ? (
              <Input
                value={form.Email_PERSONAL ?? ""}
                onChange={(e) => onChange("Email_PERSONAL", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Email_PERSONAL || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Celular</p>
            {isEditing ? (
              <Input
                value={form.Celular ?? ""}
                onChange={(e) => onChange("Celular", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Celular || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Dirección</p>
            {isEditing ? (
              <Input
                value={form.DIRECCION_ANTIGUA ?? ""}
                onChange={(e) => onChange("DIRECCION_ANTIGUA", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.DIRECCION_ANTIGUA || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Ciudad</p>
            {isEditing ? (
              <Input
                value={form.Ciudad ?? ""}
                onChange={(e) => onChange("Ciudad", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Ciudad || "-"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* EMERGENCIA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Contacto de emergencia
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Contacto</p>
            {isEditing ? (
              <Input
                value={form.Contacto_Emergencia ?? ""}
                onChange={(e) => onChange("Contacto_Emergencia", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Contacto_Emergencia || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Teléfono</p>
            {isEditing ? (
              <Input
                value={form.Telefono_Emergencia ?? ""}
                onChange={(e) => onChange("Telefono_Emergencia", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Telefono_Emergencia || "-"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LABORAL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Información laboral
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Estado</p>
            {isEditing ? (
              <Input
                value={form.Estado ?? ""}
                onChange={(e) => onChange("Estado", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Estado || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">ROL</p>
            {isEditing ? (
              <Input
                value={form.ROL ?? ""}
                onChange={(e) => onChange("ROL", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.ROL || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Profesión</p>
            {isEditing ? (
              <Input
                value={form.Profesion ?? ""}
                onChange={(e) => onChange("Profesion", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.Profesion || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Nivel educativo</p>
            <p className="font-medium">{data.Nivel_educativo || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* PAGO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Datos de pago
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Banco</p>
            {isEditing ? (
              <Input
                value={form.BANCO_PAGO ?? ""}
                onChange={(e) => onChange("BANCO_PAGO", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.BANCO_PAGO || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Tipo cuenta</p>
            {isEditing ? (
              <Input
                value={form.TIPO_CUENTA_PAGO ?? ""}
                onChange={(e) => onChange("TIPO_CUENTA_PAGO", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.TIPO_CUENTA_PAGO || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Número cuenta</p>
            {isEditing ? (
              <Input
                value={form.NUMERO_CUENTA_PAGO ?? ""}
                onChange={(e) => onChange("NUMERO_CUENTA_PAGO", e.target.value)}
              />
            ) : (
              <p className="font-medium">{data.NUMERO_CUENTA_PAGO || "-"}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500">Titular</p>
            {isEditing ? (
              <Input
                value={form.TITULAR_CUENTA_PAGO ?? ""}
                onChange={(e) =>
                  onChange("TITULAR_CUENTA_PAGO", e.target.value)
                }
              />
            ) : (
              <p className="font-medium">{data.TITULAR_CUENTA_PAGO || "-"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NOTAS */}
      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {isEditing ? (
            <textarea
              className="w-full min-h-[120px] border rounded p-3"
              value={form.Notas ?? ""}
              onChange={(e) => onChange("Notas", e.target.value)}
            />
          ) : (
            <div className="whitespace-pre-wrap">{data.Notas || "-"}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
