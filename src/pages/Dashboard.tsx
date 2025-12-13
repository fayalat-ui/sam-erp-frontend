import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";

import { getDashboardCounts, type DashboardCounts } from "@/services/dashboardAdapter";

export default function Dashboard() {
  const { user, canRead } = useSharePointAuth();

  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getDashboardCounts();
      setCounts(data);
      setLoading(false);
    };
    load();
  }, []);

  // Trabajadores
  const t = counts?.trabajadores;
  const tTotal = (t?.activos ?? 0) + (t?.desvinculados ?? 0) + (t?.listaNegra ?? 0);

  // Servicios
  const s = counts?.servicios;
  const sTotal = (s?.activos ?? 0) + (s?.terminados ?? 0);

  const hoy = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* HEADER */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-slate-500">{hoy}</p>

            <h1 className="text-3xl font-bold text-slate-900">
              Hola,{" "}
              <span className="text-blue-700">{user?.displayName || "Usuario"}</span>
            </h1>

            <p className="text-slate-600 max-w-2xl">
              Este panel presenta un resumen del estado actual de las personas,
              los servicios y la operación.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="h-4 w-4 mr-1" />
                SharePoint conectado
              </Badge>

              {canRead("rrhh") && (
                <Link to="/trabajadores">
                  <Button size="sm" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Ver trabajadores
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}

              {canRead("osp") && (
                <Link to="/servicios">
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Ver servicios
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canRead("rrhh") && (
            <Kpi
              icon={Users}
              titulo="Trabajadores activos"
              valor={t?.activos ?? 0}
              total={tTotal}
              loading={loading}
              color="blue"
            />
          )}

          {canRead("osp") && (
            <Kpi
              icon={Briefcase}
              titulo="Servicios activos"
              valor={s?.activos ?? 0}
              total={sTotal}
              loading={loading}
              color="purple"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  titulo,
  valor,
  total,
  loading,
  color,
}: {
  icon: any;
  titulo: string;
  valor: number;
  total: number;
  loading: boolean;
  color: "blue" | "purple";
}) {
  const palette = {
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    purple: "border-purple-200 bg-purple-50 text-purple-800",
  }[color];

  return (
    <Card className={`border ${palette}`}>
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wide">{titulo}</p>
        </div>

        {loading ? (
          <div className="h-7 w-20 bg-slate-300 animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-bold">
            {valor}{" "}
            <span className="text-sm font-normal text-slate-500">/ {total}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
