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
  // si después creas lista de usuarios, agregamos getUsuarios en el service
} from "@/services/sharepointService";
import {
  Users,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle,
  TrendingUp,
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

  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false);
  const [loadingMandantes, setLoadingMandantes] = useState(false);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [loadingVacaciones, setLoadingVacaciones] = useState(false);

  useEffect(() => {
    // Trabajadores
    if (canRead("rrhh")) {
      setLoadingTrabajadores(true);
      getTrabajadores()
        .then((data) => setTrabajadores(data))
        .catch((err) => {
          console.error("Error cargando trabajadores:", err);
          setTrabajadores([]);
        })
        .finally(() => setLoadingTrabajadores(false));
    }

    // Mandantes
    if (canRead("administradores")) {
      setLoadingMandantes(true);
      getMandantes()
        .then((data) => setMandantes(data))
        .catch((err) => {
          console.error("Error cargando mandantes:", err);
          setMandantes([]);
        })
        .finally(() => setLoadingMandantes(false));
    }

    // Servicios
    if (canRead("osp")) {
      setLoadingServicios(true);
      getServicios()
        .then((data) => setServicios(data))
        .catch((err) => {
          console.error("Error cargando servicios:", err);
          setServicios([]);
        })
        .finally(() => setLoadingServicios(false));
    }

    // Vacaciones
    if (canRead("rrhh")) {
      setLoadingVacaciones(true);
      getVacaciones()
        .then((data) => setVacaciones(data))
        .catch((err) => {
          console.error("Error cargando vacaciones:", err);
          setVacaciones([]);
        })
        .finally(() => setLoadingVacaciones(false));
    }
  }, [canRead]);

  // Helpers para leer Estado desde fields
  const getEstadoCount = (items: SpItem[] | null, estado = "Activo") =>
    items?.filter((i) => i?.fields?.Estado === estado).length || 0;

  const getTotal = (items: SpItem[] | null) => items?.length || 0;

  const stats = [
    {
      title: "Trabajadores Activos",
      value: getEstadoCount(trabajadores, "Activo"),
      total: getTotal(trabajadores),
      icon: Users,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      href: "/trabajadores",
      loading: loadingTrabajadores,
      canView: canRead("rrhh"),
    },
    {
      title: "Mandantes",
      value: getEstadoCount(mandantes, "Activo"),
      total: getTotal(mandantes),
      icon: Building2,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      href: "/mandantes",
      loading: loadingMandantes,
      canView: canRead("administradores"),
    },
    {
      title: "Servicios Activos",
      value: getEstadoCount(servicios, "Activo"),
      total: getTotal(servicios),
      icon: Briefcase,
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      href: "/servicios",
      loading: loadingServicios,
      canView: canRead("osp"),
    },
    {
      title: "Registros Vacaciones",
      value: getTotal(vacaciones),
      total: getTotal(vacaciones),
      icon: Calendar,
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      href: "/vacaciones",
      loading: loadingVacaciones,
      canView: canRead("rrhh"),
    },
  ];

  const visibleStats = stats.filter((stat) => stat.canView);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Bienvenido,{" "}
                <span className="font-semibold text-gray-800">
                  {user?.nombre}
                </span>
                . Resumen del sistema SAM ERP.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                SharePoint Conectado
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`hover:shadow-lg transition-all duration-200 border-2 ${stat.borderColor} ${stat.bgColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {stat.title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      {stat.loading ? (
                        <div className="animate-pulse">
                          <div className="h-8 w-16 bg-gray-300 rounded"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                          <p className="text-lg text-gray-500">
                            / {stat.total}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link to={stat.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full font-semibold ${stat.color} border-current hover:bg-current hover:text-white transition-all duration-200`}
                      >
                        Ver detalles
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">
              Accesos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {canRead("rrhh") && (
                <Link to="/trabajadores">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <Users className="h-6 w-6 text-blue-700" />
                    <span className="text-sm font-semibold text-gray-800">
                      Trabajadores
                    </span>
                  </Button>
                </Link>
              )}

              {canRead("administradores") && (
                <Link to="/mandantes">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                  >
                    <Building2 className="h-6 w-6 text-emerald-700" />
                    <span className="text-sm font-semibold text-gray-800">
                      Mandantes
                    </span>
                  </Button>
                </Link>
              )}

              {canRead("osp") && (
                <Link to="/servicios">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  >
                    <Briefcase className="h-6 w-6 text-purple-700" />
                    <span className="text-sm font-semibold text-gray-800">
                      Servicios
                    </span>
                  </Button>
                </Link>
              )}

              {canRead("rrhh") && (
                <Link to="/vacaciones">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                  >
                    <Calendar className="h-6 w-6 text-orange-700" />
                    <span className="text-sm font-semibold text-gray-800">
                      Vacaciones
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
