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
