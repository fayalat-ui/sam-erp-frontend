import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

import { getTrabajadorById } from "@/services/sharepointService";

/**
 * Modelo completo SOLO para visualización
 * Respeta nombres reales de SharePoint
 */
interface TrabajadorDetalle {
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

/**
 * Utilidad local: formatea fecha YYYY-MM-DD
 */
function formatFecha(fecha?: string) {
  if (!fecha) return "-";
  return fecha.slice(0, 10);
}

export default function TrabajadorDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<TrabajadorDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      /**
       * getTrabajadorById(id) devuelve:
       * { id, fields: { ...columnas SharePoint... } }
       */
      const item = await getTrabajadorById(id);
      const f = item.fields || {};

      setData({
        id: item.id,
        ...f,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar trabajador";
      console.error("Error cargando trabajador:", err);
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-800">
            {error || "No se pudo cargar el trabajador"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Volver */}
      <Button variant="outline" onClick={() => navigate("/trabajadores")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Trabajadores
      </Button>

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
          <p><b>Nombres:</b> {data.Nombres || "-"}</p>
          <p><b>Apellidos:</b> {data.Apellidos || "-"}</p>
          <p><b>Documento:</b> {data.N_documento || "-"}</p>
          <p><b>Tipo:</b> {data.T_documento || "-"}</p>
          <p><b>Nacimiento:</b> {formatFecha(data.NACIMIENTO)}</p>
          <p><b>Nacionalidad:</b> {data.Nacionalidad || "-"}</p>
          <p><b>Género:</b> {data.GENERO || "-"}</p>
          <p><b>Estado civil:</b> {data.Estado_civil || "-"}</p>
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
          <p><b>Email empresa:</b> {data.Email_Empresa || "-"}</p>
          <p><b>Email personal:</b> {data.Email_PERSONAL || "-"}</p>
          <p><b>Celular:</b> {data.Celular || "-"}</p>
          <p><b>Dirección:</b> {data.DIRECCION_ANTIGUA || "-"}</p>
          <p><b>Ciudad:</b> {data.Ciudad || "-"}</p>
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
          <p><b>Contacto:</b> {data.Contacto_Emergencia || "-"}</p>
          <p><b>Teléfono:</b> {data.Telefono_Emergencia || "-"}</p>
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
          <p><b>Rol:</b> {data.ROL || "-"}</p>
          <p><b>Profesión:</b> {data.Profesion || "-"}</p>
          <p><b>Nivel educativo:</b> {data.Nivel_educativo || "-"}</p>
          <p><b>Inscripción militar:</b> {data.Inscripcion_militar || "-"}</p>
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
          <p><b>Banco:</b> {data.BANCO_PAGO || "-"}</p>
          <p><b>Tipo cuenta:</b> {data.TIPO_CUENTA_PAGO || "-"}</p>
          <p><b>N° cuenta:</b> {data.NUMERO_CUENTA_PAGO || "-"}</p>
          <p><b>Titular:</b> {data.TITULAR_CUENTA_PAGO || "-"}</p>
        </CardContent>
      </Card>

      {/* NOTAS */}
      {data.Notas && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">
            {data.Notas}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
