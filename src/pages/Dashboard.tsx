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
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, canRead } = useSharePointAuth();
  
  // Cargar datos de diferentes módulos
  const { data: trabajadores, loading: loadingTrabajadores } = useSharePointData(
    trabajadoresService, 
    { 
      listName: SHAREPOINT_LISTS.TRABAJADORES,
      select: 'id,nombre,apellido,activo',
      enabled: canRead('rrhh')
    }
  );
  
  const { data: mandantes, loading: loadingMandantes } = useSharePointData(
    mandantesService, 
    { 
      listName: SHAREPOINT_LISTS.MANDANTES,
      select: 'id,nombre,activo',
      enabled: canRead('administradores')
    }
  );
  
  const { data: servicios, loading: loadingServicios } = useSharePointData(
    serviciosService, 
    { 
      listName: SHAREPOINT_LISTS.SERVICIOS,
      select: 'id,nombre,estado',
      enabled: canRead('osp')
    }
  );

  const { data: usuarios, loading: loadingUsuarios } = useSharePointData(
    usuariosService, 
    { 
      listName: SHAREPOINT_LISTS.USUARIOS,
      select: 'id,nombre,activo',
      enabled: canRead('usuarios')
    }
  );

  // Calcular estadísticas
  const stats = [
    {
      title: 'Trabajadores Activos',
      value: trabajadores?.filter(t => t.activo)?.length || 0,
      total: trabajadores?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/trabajadores',
      loading: loadingTrabajadores,
      canView: canRead('rrhh')
    },
    {
      title: 'Mandantes',
      value: mandantes?.filter(m => m.activo)?.length || 0,
      total: mandantes?.length || 0,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/mandantes',
      loading: loadingMandantes,
      canView: canRead('administradores')
    },
    {
      title: 'Servicios Activos',
      value: servicios?.filter(s => s.estado === 'activo')?.length || 0,
      total: servicios?.length || 0,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/servicios',
      loading: loadingServicios,
      canView: canRead('osp')
    },
    {
      title: 'Usuarios Sistema',
      value: usuarios?.filter(u => u.activo)?.length || 0,
      total: usuarios?.length || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/usuarios',
      loading: loadingUsuarios,
      canView: canRead('usuarios')
    }
  ];

  const visibleStats = stats.filter(stat => stat.canView);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido, {user?.nombre}. Aquí tienes un resumen de tu sistema SAM ERP.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      {stat.loading ? (
                        <div className="animate-pulse">
                          <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-sm text-gray-500">/ {stat.total}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <Link to={stat.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Sistema iniciado</p>
                  <p className="text-sm text-gray-600">Conectado a SharePoint exitosamente</p>
                </div>
              </div>
              
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sesión iniciada</p>
                    <p className="text-sm text-gray-600">
                      {user.nombre} - {user.rol_nombre}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">SharePoint</span>
                </div>
                <Badge variant="default" className="bg-green-600">Conectado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Azure AD</span>
                </div>
                <Badge variant="default" className="bg-green-600">Autenticado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Permisos</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {Object.keys(user?.permisos || {}).length} módulos
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {canRead('rrhh') && (
              <Link to="/trabajadores">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Trabajadores</span>
                </Button>
              </Link>
            )}
            
            {canRead('administradores') && (
              <Link to="/mandantes">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Building2 className="h-5 w-5" />
                  <span className="text-sm">Mandantes</span>
                </Button>
              </Link>
            )}
            
            {canRead('osp') && (
              <Link to="/servicios">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-sm">Servicios</span>
                </Button>
              </Link>
            )}
            
            {canRead('rrhh') && (
              <Link to="/vacaciones">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Vacaciones</span>
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}