import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import {
  getTrabajadores,
  getMandantes,
  getServicios,
  getVacaciones,
} from "@/services/sharepointService";
import {
  Users,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

type SpItem = {
  id: string;
  fields: Record<string, any>;
};

export default function Dashboard() {
  const { user, canRead } = useSharePointAuth();

  const [trabajadores, setTrabajadores] = useState<SpItem[] | null>(null);
  const [mandantes, setMandantes] = useState<SpItem[] | null>(null);
  const [servicios, setServicios] = useState<SpItem[] | null>(null);
  const [vacaciones, setVacaciones] = useState<SpItem[] | null>(null);

  const [loading, setLoading] = useState({
    trabajadores: false,
    mandantes: false,
    servicios: false,
    vacaciones: false,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        // Trabajadores
        if (canRead("rrhh")) {
          setLoading((p) => ({ ...p, trabajadores: true }));
          const data = await getTrabajadores();
          setTrabajadores(data);
          setLoading((p) => ({ ...p, trabajadores: false }));
        }

        // Mandantes
        if (canRead("administradores")) {
          setLoading((p) => ({ ...p, mandantes: true }));
          const data = await getMandantes();
          setMandantes(data);
          setLoading((p) => ({ ...p, mandantes: false }));
        }

        // Servicios
        if (canRead("osp")) {
          setLoading((p) => ({ ...p, servicios: true }));
          const data = await getServicios();
          setServicios(data);
          setLoading((p) => ({ ...p, servicios: false }));
        }

        // Vacaciones
        if (canRead("rrhh")) {
          setLoading((p) => ({ ...p, vacaciones: true }));
          const data = await getVacaciones();
          setVacaciones(data);
          setLoading((p) => ({ ...p, vacaciones: false }));
        }
      } catch (e: any) {
        console.error("Error cargando dashboard:", e);
        setError(e?.message || "Error al cargar datos del dashboard");
        setLoading({
          trabajadores: false,
          mandantes: false,
          servicios: false,
          vacaciones: false,
        });
      }
    };

    void loadAll();
  }, [canRead]);

  const getEstadoCount = (items: SpItem[] | null, estado = "Activo") =>
    items?.filter(
      (i) =>
        i?.fields?.ESTADO_ === estado ||
        i?.fields?.Estado === estado ||
        i?.fields?.estado === estado
    ).length || 0;

  const getTotal = (items: SpItem[] | null) => items?.length || 0;

  const totalTrabajadores = getTotal(trabajadores);
  const activosTrabajadores = getEstadoCount(trabajadores, "Activo");

  const totalServicios = getTotal(servicios);
  const activosServicios = getEstadoCount(servicios, "Activo");

  const totalMandantes = getTotal(mandantes);
  const totalVacaciones = getTotal(vacaciones);

  const anyLoading =
    loading.trabajadores ||
    loading.mandantes ||
    loading.servicios ||
    loading.vacaciones;

  const hoy = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* HEADER: Bienvenida + estado conexión */}
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{hoy}</p>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">
                    Hola,{" "}
                    <span className="text-blue-700">
                      {user?.displayName || "Usuario"}
                    </span>
                  </h1>
                  <p className="mt-2 text-slate-600 text-sm md:text-base max-w-xl">
                    Este es el panel de control de{" "}
                    <span className="font-semibold">SAM ERP</span>. Aquí ves de
                    un golpe cómo están las personas, los servicios y la
                    operación.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  SharePoint conectado
                </Badge>

                {anyLoading && (
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">
                    <TrendingUp className="h-4 w-4 mr-1.5" />
                    Actualizando datos...
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {canRead("rrhh") && (
                  <Link to="/trabajadores">
                    <Button
                      size="sm"
                      className="rounded-full flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Ver trabajadores
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}

                {canRead("osp") && (
                  <Link to="/servicios">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-slate-300"
                    >
                      <Briefcase className="h-4 w-4 mr-1" />
                      Servicios activos
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-slate-900 text-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Salud del sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Trabajadores activos
                </span>
                <span className="text-lg font-semibold">
                  {activosTrabajadores}/{totalTrabajadores || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Servicios activos
                </span>
                <span className="text-lg font-semibold">
                  {activosServicios}/{totalServicios || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Mandantes</span>
                <span className="text-lg font-semibold">
                  {totalMandantes || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Registros de vacaciones
                </span>
                <span className="text-lg font-semibold">
                  {totalVacaciones || 0}
                </span>
              </div>

              {error && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* GRID PRINCIPAL DE KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {canRead("rrhh") && (
            <KpiCard
              titulo="Trabajadores activos"
              total={totalTrabajadores}
              valor={activosTrabajadores}
              icon={Users}
              color="blue"
              href="/trabajadores"
              loading={loading.trabajadores}
            />
          )}

          {canRead("administradores") && (
            <KpiCard
              titulo="Mandantes"
              total={totalMandantes}
              valor={totalMandantes}
              icon={Building2}
              color="emerald"
              href="/mandantes"
              loading={loading.mandantes}
            />
          )}

          {canRead("osp") && (
            <KpiCard
              titulo="Servicios activos"
              total={totalServicios}
              valor={activosServicios}
              icon={Briefcase}
              color="purple"
              href="/servicios"
              loading={loading.servicios}
            />
          )}

          {canRead("rrhh") && (
            <KpiCard
              titulo="Registros vacaciones"
              total={totalVacaciones}
              valor={totalVacaciones}
              icon={Calendar}
              color="orange"
              href="/vacaciones"
              loading={loading.vacaciones}
            />
          )}
        </div>

        {/* DOS BLOQUES DE RESUMEN: RRHH / Operaciones */}
        <div className="grid gap-5 lg:grid-cols-2">
          {canRead("rrhh") && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Users className="h-5 w-5 text-blue-600" />
                  Resumen RRHH
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <ResumenLinea
                  etiqueta="Total trabajadores"
                  valor={totalTrabajadores}
                />
                <ResumenLinea
                  etiqueta="Activos"
                  valor={activosTrabajadores}
                />
                <ResumenLinea
                  etiqueta="En vacaciones (registros)"
                  valor={totalVacaciones}
                />
                <div className="mt-3">
                  <Link to="/trabajadores">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Ver módulo RRHH
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {(canRead("osp") || canRead("administradores")) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  Resumen Operaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <ResumenLinea
                  etiqueta="Servicios totales"
                  valor={totalServicios}
                />
                <ResumenLinea
                  etiqueta="Servicios activos"
                  valor={activosServicios}
                />
                <ResumenLinea
                  etiqueta="Mandantes"
                  valor={totalMandantes}
                />
                <div className="mt-3 flex gap-2 flex-wrap">
                  {canRead("osp") && (
                    <Link to="/servicios">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        Ir a servicios
                      </Button>
                    </Link>
                  )}
                  {canRead("administradores") && (
                    <Link to="/mandantes">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        Ir a mandantes
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tarjeta KPI reutilizable */
interface KpiProps {
  titulo: string;
  valor: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "emerald" | "purple" | "orange";
  href: string;
  loading?: boolean;
}

function KpiCard({
  titulo,
  valor,
  total,
  icon: Icon,
  color,
  href,
  loading,
}: KpiProps) {
  const palettes: Record<
    KpiProps["color"],
    { bg: string; text: string; border: string; pill: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      pill: "bg-blue-100 text-blue-700",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      pill: "bg-emerald-100 text-emerald-700",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-800",
      border: "border-purple-200",
      pill: "bg-purple-100 text-purple-700",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-200",
      pill: "bg-orange-100 text-orange-700",
    },
  };

  const cfg = palettes[color];
  const porcentaje =
    total > 0 ? Math.round((valor / total) * 100) : valor > 0 ? 100 : 0;

  return (
    <Card
      className={`shadow-sm border ${cfg.border} ${cfg.bg} hover:shadow-md transition-all duration-150`}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2 rounded-xl border ${cfg.border} bg-white/60 shadow-xs`}
          >
            <Icon className={`h-5 w-5 ${cfg.text}`} />
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${cfg.pill} font-medium`}
          >
            {porcentaje}% del total
          </span>
        </div>

        <div className="space-y-1 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {titulo}
          </p>
          {loading ? (
            <div className="mt-2 animate-pulse">
              <div className="h-7 w-20 bg-slate-300 rounded" />
            </div>
          ) : (
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {valor}
              </span>
              <span className="text-sm text-slate-500">/ {total}</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <Link to={href}>
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Ver detalles
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ResumenLinea({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{etiqueta}</span>
      <span className="font-semibold text-slate-900">{valor}</span>
    </div>
  );
}
