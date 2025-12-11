import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { useSharePointData } from '@/hooks/useSharePointData';
import { trabajadoresService, mandantesService, serviciosService, usuariosService } from '@/lib/sharepoint-services';
import { SHAREPOINT_LISTS } from '@/lib/sharepoint-mappings';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Calendar, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, canRead } = useSharePointAuth();
  
  // Cargar datos de diferentes módulos
  const { data: trabajadores, loading: loadingTrabajadores } = useSharePointData(
    trabajadoresService, 
    { 
      listName: SHAREPOINT_LISTS.TRABAJADORES,
      select: 'id,Title,Estado',
      enabled: canRead('rrhh')
    }
  );
  
  const { data: mandantes, loading: loadingMandantes } = useSharePointData(
    mandantesService, 
    { 
      listName: SHAREPOINT_LISTS.MANDANTES,
      select: 'id,Title,Estado',
      enabled: canRead('administradores')
    }
  );
  
  const { data: servicios, loading: loadingServicios } = useSharePointData(
    serviciosService, 
    { 
      listName: SHAREPOINT_LISTS.SERVICIOS,
      select: 'id,Title,Estado',
      enabled: canRead('osp')
    }
  );

  const { data: usuarios, loading: loadingUsuarios } = useSharePointData(
    usuariosService, 
    { 
      listName: SHAREPOINT_LISTS.USUARIOS,
      select: 'id,Title,Estado',
      enabled: canRead('usuarios')
    }
  );

  // Calcular estadísticas
  const stats = [
    {
      title: 'Trabajadores Activos',
      value: trabajadores?.filter(t => t.Estado === 'Activo')?.length || 0,
      total: trabajadores?.length || 0,
      icon: Users,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/trabajadores',
      loading: loadingTrabajadores,
      canView: canRead('rrhh')
    },
    {
      title: 'Mandantes',
      value: mandantes?.filter(m => m.Estado === 'Activo')?.length || 0,
      total: mandantes?.length || 0,
      icon: Building2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      href: '/mandantes',
      loading: loadingMandantes,
      canView: canRead('administradores')
    },
    {
      title: 'Servicios Activos',
      value: servicios?.filter(s => s.Estado === 'Activo')?.length || 0,
      total: servicios?.length || 0,
      icon: Briefcase,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      href: '/servicios',
      loading: loadingServicios,
      canView: canRead('osp')
    },
    {
      title: 'Usuarios Sistema',
      value: usuarios?.filter(u => u.Estado === 'Activo')?.length || 0,
      total: usuarios?.length || 0,
      icon: Users,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      href: '/usuarios',
      loading: loadingUsuarios,
      canView: canRead('usuarios')
    }
  ];

  const visibleStats = stats.filter(stat => stat.canView);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600 text-lg">
                Bienvenido, <span className="font-semibold text-gray-800">{user?.nombre}</span>. 
                Resumen del sistema SAM ERP.
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
              <Card key={index} className={`hover:shadow-lg transition-all duration-200 border-2 ${stat.borderColor} ${stat.bgColor}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
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
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-lg text-gray-500">/ {stat.total}</p>
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
            <CardTitle className="text-xl font-bold text-gray-900">Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {canRead('rrhh') && (
                <Link to="/trabajadores">
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex flex-col gap-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <Users className="h-6 w-6 text-blue-700" />
                    <span className="text-sm font-semibold text-gray-800">Trabajadores</span>
                  </Button>
                </Link>
              )}
              
              {canRead('administradores') && (
                <Link to="/mandantes">
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex flex-col gap-2 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                  >
                    <Building2 className="h-6 w-6 text-emerald-700" />
                    <span className="text-sm font-semibold text-gray-800">Mandantes</span>
                  </Button>
                </Link>
              )}
              
              {canRead('osp') && (
                <Link to="/servicios">
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex flex-col gap-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  >
                    <Briefcase className="h-6 w-6 text-purple-700" />
                    <span className="text-sm font-semibold text-gray-800">Servicios</span>
                  </Button>
                </Link>
              )}
              
              {canRead('rrhh') && (
                <Link to="/vacaciones">
                  <Button 
                    variant="outline" 
                    className="w-full h-20 flex flex-col gap-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                  >
                    <Calendar className="h-6 w-6 text-orange-700" />
                    <span className="text-sm font-semibold text-gray-800">Vacaciones</span>
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