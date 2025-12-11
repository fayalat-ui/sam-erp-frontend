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
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, canRead } = useSharePointAuth();
  
  // Cargar datos de diferentes módulos con manejo de errores mejorado
  const { data: trabajadores, loading: loadingTrabajadores, error: errorTrabajadores } = useSharePointData(
    trabajadoresService, 
    { 
      listName: SHAREPOINT_LISTS.TRABAJADORES,
      select: 'Id,Title,Estado',
      enabled: canRead('rrhh')
    }
  );
  
  const { data: mandantes, loading: loadingMandantes, error: errorMandantes } = useSharePointData(
    mandantesService, 
    { 
      listName: SHAREPOINT_LISTS.MANDANTES,
      select: 'Id,Title,Estado',
      enabled: canRead('administradores')
    }
  );
  
  const { data: servicios, loading: loadingServicios, error: errorServicios } = useSharePointData(
    serviciosService, 
    { 
      listName: SHAREPOINT_LISTS.SERVICIOS,
      select: 'Id,Title,Estado',
      enabled: canRead('osp')
    }
  );

  const { data: usuarios, loading: loadingUsuarios, error: errorUsuarios } = useSharePointData(
    usuariosService, 
    { 
      listName: SHAREPOINT_LISTS.USUARIOS,
      select: 'Id,Title,Estado',
      enabled: canRead('usuarios')
    }
  );

  // Calcular estadísticas con manejo seguro de datos
  const stats = [
    {
      title: 'Trabajadores',
      value: trabajadores?.filter(t => t.Estado === 'Activo')?.length || 0,
      total: trabajadores?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/trabajadores',
      loading: loadingTrabajadores,
      error: errorTrabajadores,
      canView: canRead('rrhh')
    },
    {
      title: 'Mandantes',
      value: mandantes?.filter(m => m.Estado === 'Activo')?.length || 0,
      total: mandantes?.length || 0,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/mandantes',
      loading: loadingMandantes,
      error: errorMandantes,
      canView: canRead('administradores')
    },
    {
      title: 'Servicios',
      value: servicios?.filter(s => s.Estado === 'Activo')?.length || 0,
      total: servicios?.length || 0,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/servicios',
      loading: loadingServicios,
      error: errorServicios,
      canView: canRead('osp')
    },
    {
      title: 'Usuarios',
      value: usuarios?.filter(u => u.Estado === 'Activo')?.length || 0,
      total: usuarios?.length || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/usuarios',
      loading: loadingUsuarios,
      error: errorUsuarios,
      canView: canRead('usuarios')
    }
  ];

  const visibleStats = stats.filter(stat => stat.canView);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido, {user?.displayName || user?.mail}. Resumen del sistema SAM ERP.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            SharePoint Conectado
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      {stat.loading ? (
                        <div className="animate-pulse">
                          <div className="h-6 w-12 bg-gray-200 rounded"></div>
                        </div>
                      ) : stat.error ? (
                        <p className="text-sm text-red-500">Error</p>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-sm text-gray-500">/ {stat.total}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <Link to={stat.href}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {canRead('rrhh') && (
              <Link to="/trabajadores">
                <Button variant="outline" className="w-full h-14 flex flex-col gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Trabajadores</span>
                </Button>
              </Link>
            )}
            
            {canRead('administradores') && (
              <Link to="/mandantes">
                <Button variant="outline" className="w-full h-14 flex flex-col gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">Mandantes</span>
                </Button>
              </Link>
            )}
            
            {canRead('osp') && (
              <Link to="/servicios">
                <Button variant="outline" className="w-full h-14 flex flex-col gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Servicios</span>
                </Button>
              </Link>
            )}
            
            {canRead('rrhh') && (
              <Link to="/vacaciones">
                <Button variant="outline" className="w-full h-14 flex flex-col gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Vacaciones</span>
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}