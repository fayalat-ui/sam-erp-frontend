import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import {
  getMandantes,
  getVacaciones,
  getDashboardCounts,
  type DashboardCounts,
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
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, canRead } = useSharePointAuth();

  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [mandantesTotal, setMandantesTotal] = useState<number>(0);
  const [vacacionesTotal, setVacacionesTotal] = useState<number>(0);

  const [loading, setLoading] = useState({
    dashboard: false,
    mandantes: false,
    vacaciones: false,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setError(null);

        // Dashboard counts (depende de varias listas)
        setLoading((p) => ({ ...p, dashboard: true }));
        const dash = await getDashboardCounts();
        setCounts(dash);
        setLoading((p) => ({ ...p, dashboard: false }));

        // Mandantes (solo total)
        if (canRead("administradores")) {
          setLoading((p) => ({ ...p, mandantes: true }));
          const m = await getMandantes();
          setMandantesTotal((m as any[])?.length || 0);
          setLoading((p) => ({ ...p, mandantes: false }));
        }

        // Vacaciones (solo total registros)
        if (canRead("rrhh")) {
          setLoading((p) => ({ ...p, vacaciones: true }));
          const v = await getVacaciones();
          setVacacionesTotal((v as any[])?.length || 0);
          setLoading((p) => ({ ...p, vacaciones: false }));
        }
      } catch (e: any) {
        console.error("Error cargando dashboard:", e);
        setError(e?.message || "Error al cargar datos del dashboard");
        setLoading({
          dashboard: false,
          mandantes: false,
          vacaciones: false,
        });
      }
    };

    void loadAll();
  }, [canRead]);

  const anyLoading = loading.dashboard || loading.mandantes || loading.vacaciones;

  // Trabajadores
  const tActivos = counts?.trabajadores.activos ?? 0;
  const tDesv = counts?.trabajadores.desvinculados ?? 0;
  const tNegra = counts?.trabajadores.listaNegra ?? 0;
  const tTotal = tActivos + tDesv + tNegra;

  // Servicios
  const sActivos = counts?.servicios.activos ?? 0;
  const sTerminados = counts?.servicios.terminados ?? 0;
  const sTotal = sActivos + sTerminados;

  // Solicitudes contratos
  const scSolicitado = counts?.solicitudesContratos.contratoSolicitado ?? 0;
  const scRevisar = counts?.solicitudesContratos.enviadoARevisar ?? 0;
  const scRechazado = counts?.solicitudesContratos.rechazado ?? 0;
  const scTotal = scSolicitado + scRevisar + scRechazado;

  // Directivas
  const dVencidas = counts?.directivas.vencidas ?? 0;
  const dPorVencer = counts?.directivas.porVencer ?? 0;
  const dVigentes = counts?.directivas.vigentes ?? 0;
  const dTotal = dVencidas + dPorVencer + dVigentes;

  // OS10
  const oVencidas = counts?.os10.vencidas ?? 0;
  const oPorVencer = counts?.os10.porVencer ?? 0;
  const oVigentes = counts?.os10.vigentes ?? 0;
  const oTotal = oVencidas + oPorVencer + oVigentes;

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
                      Servicios
                    </Button>
                  </Link>
                )}

                {canRead("administradores") && (
                  <Link to="/mandantes">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-slate-300"
                    >
                      <Building2 className="h-4 w-4 mr-1" />
                      Mandantes
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
                  {tActivos}/{tTotal}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Servicios activos</span>
                <span className="text-lg font-semibold">
                  {sActivos}/{sTotal}
                </span>
              </div>

              {canRead("administradores") && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Mandantes</span>
                  <span className="text-lg font-semibold">{mandantesTotal}</span>
                </div>
              )}

              {canRead("rrhh") && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    Registros de vacaciones
                  </span>
                  <span className="text-lg font-semibold">{vacacionesTotal}</span>
                </div>
              )}

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
              titulo="Trabajadores (Act/Desv/Negra)"
              total={tTotal}
              valor={tActivos}
              icon={Users}
              color="blue"
              href="/trabajadores"
              loading={loading.dashboard}
            />
          )}

          {canRead("osp") && (
            <KpiCard
              titulo="Servicios (Activos)"
              total={sTotal}
              valor={sActivos}
              icon={Briefcase}
              color="purple"
              href="/servicios"
              loading={loading.dashboard}
            />
          )}

          {canRead("rrhh") && (
            <KpiCard
              titulo="Solicitudes contrato (Pendientes)"
              total={scTotal}
              valor={scSolicitado + scRevisar}
              icon={FileText}
              color="orange"
              href="/contratos"
              loading={loading.dashboard}
            />
          )}

          {canRead("rrhh") && (
            <KpiCard
              titulo="OS10 (Por vencer)"
              total={oTotal}
              valor={oPorVencer}
              icon={ShieldCheck}
              color="emerald"
              href="/cursos"
              loading={loading.dashboard}
            />
          )}
        </div>

        {/* BLOQUES DE RESUMEN */}
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
                <ResumenLinea etiqueta="Activos" valor={tActivos} />
                <ResumenLinea etiqueta="Desvinculados" valor={tDesv} />
                <ResumenLinea etiqueta="Lista negra" valor={tNegra} />
                <ResumenLinea etiqueta="Solicitudes: contrato solicitado" valor={scSolicitado} />
                <ResumenLinea etiqueta="Solicitudes: enviado a revisar" valor={scRevisar} />
                <ResumenLinea etiqueta="Solicitudes: rechazado" valor={scRechazado} />
                <ResumenLinea etiqueta="Vacaciones (registros)" valor={vacacionesTotal} />
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Link to="/trabajadores">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Ver trabajadores
                    </Button>
                  </Link>
                  <Link to="/contratos">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Ver contratos
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
                  Resumen Operaciones & Cumplimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <ResumenLinea etiqueta="Servicios activos" valor={sActivos} />
                <ResumenLinea etiqueta="Servicios terminados" valor={sTerminados} />
                {canRead("administradores") && (
                  <ResumenLinea etiqueta="Mandantes" valor={mandantesTotal} />
                )}

                <div className="mt-2 pt-2 border-t border-slate-200">
                  <ResumenLinea etiqueta="Directivas vencidas" valor={dVencidas} />
                  <ResumenLinea etiqueta="Directivas por vencer (2 meses)" valor={dPorVencer} />
                  <ResumenLinea etiqueta="Directivas vigentes" valor={dVigentes} />
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200">
                  <ResumenLinea etiqueta="OS10 vencidos" valor={oVencidas} />
                  <ResumenLinea etiqueta="OS10 por vencer (2 meses)" valor={oPorVencer} />
                  <ResumenLinea etiqueta="OS10 vigentes" valor={oVigentes} />
                </div>

                <div className="mt-3 flex gap-2 flex-wrap">
                  {canRead("osp") && (
                    <Link to="/servicios">
                      <Button variant="outline" size="sm" className="rounded-full">
                        Ir a servicios
                      </Button>
                    </Link>
                  )}
                  <Link to="/directivas">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Ver directivas
                    </Button>
                  </Link>
                  <Link to="/cursos">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Ver OS10
                    </Button>
                  </Link>
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

function KpiCard({ titulo, valor, total, icon: Icon, color, href, loading }: KpiProps) {
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
  const porcentaje = total > 0 ? Math.round((valor / total) * 100) : valor > 0 ? 100 : 0;

  return (
    <Card className={`shadow-sm border ${cfg.border} ${cfg.bg} hover:shadow-md transition-all duration-150`}>
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-xl border ${cfg.border} bg-white/60 shadow-xs`}>
            <Icon className={`h-5 w-5 ${cfg.text}`} />
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.pill} font-medium`}>
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
              <span className="text-2xl font-bold text-slate-900">{valor}</span>
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
