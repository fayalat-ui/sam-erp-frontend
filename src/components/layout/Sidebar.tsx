import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Calendar,
  UserCircle,
  Building,
  Shield,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { MODULES, ACTIONS } from '@/lib/permissions';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, module: MODULES.DASHBOARD },
  { name: 'Trabajadores', href: '/trabajadores', icon: Users, module: MODULES.TRABAJADORES },
  { name: 'Clientes', href: '/clientes', icon: UserCircle, module: MODULES.CLIENTES },
  { name: 'Mandantes', href: '/mandantes', icon: Building, module: MODULES.MANDANTES },
  { name: 'Servicios', href: '/servicios', icon: Building2, module: MODULES.SERVICIOS },
  { name: 'Contratos', href: '/contratos', icon: FileText, module: MODULES.CONTRATOS },
  { name: 'Cursos OS10', href: '/cursos', icon: GraduationCap, module: MODULES.CURSOS },
  { name: 'Vacaciones', href: '/vacaciones', icon: Calendar, module: MODULES.VACACIONES },
];

const adminNavigation = [
  { name: 'Usuarios', href: '/usuarios', icon: Settings, module: MODULES.USUARIOS },
  { name: 'Roles y Permisos', href: '/roles', icon: Shield, module: MODULES.ROLES },
];

export function Sidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const visibleNavigation = navigation.filter((item) =>
    hasPermission(item.module, ACTIONS.VIEW)
  );

  const visibleAdminNavigation = adminNavigation.filter((item) =>
    hasPermission(item.module, ACTIONS.VIEW)
  );

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 top-0 bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <img src="/assets/logo-empresa.png" alt="Logo" className="h-10 w-auto" />
        <span className="text-lg font-semibold text-slate-100">ERP Seguridad</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {visibleNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        
        {visibleAdminNavigation.length > 0 && (
          <>
            <div className="pt-4 pb-2 px-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Administración
              </div>
            </div>
            {visibleAdminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-500'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}