import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCheck, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Settings, 
  Shield,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    module: 'dashboard'
  },
  {
    title: 'Trabajadores',
    href: '/trabajadores',
    icon: Users,
    module: 'trabajadores'
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Building2,
    module: 'clientes'
  },
  {
    title: 'Mandantes',
    href: '/mandantes',
    icon: UserCheck,
    module: 'mandantes'
  },
  {
    title: 'Servicios',
    href: '/servicios',
    icon: Briefcase,
    module: 'servicios'
  },
  {
    title: 'Contratos',
    href: '/contratos',
    icon: FileText,
    module: 'contratos'
  },
  {
    title: 'Cursos',
    href: '/cursos',
    icon: GraduationCap,
    module: 'cursos'
  },
  {
    title: 'Vacaciones',
    href: '/vacaciones',
    icon: Calendar,
    module: 'vacaciones'
  },
  {
    title: 'Directivas',
    href: '/directivas',
    icon: FileText,
    module: 'directivas'
  },
  {
    title: 'Jornadas',
    href: '/jornadas',
    icon: Clock,
    module: 'jornadas'
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: Settings,
    module: 'usuarios'
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: Shield,
    module: 'roles'
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Filtrar elementos del menú basado en permisos
  const visibleMenuItems = menuItems.filter(item => {
    if (item.module === 'dashboard') return true; // Dashboard siempre visible
    return hasPermission(item.module, 'read');
  });

  return (
    <div className={cn(
      "pb-12 border-r bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 shadow-xl",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="space-y-4 py-4">
        {/* Header */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2 px-4">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  SAM ERP
                </h2>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-3 py-2">
            <div className="rounded-lg bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-sm border border-slate-600/30 p-3">
              <p className="text-sm font-medium text-white">
                {user.nombre}
              </p>
              <p className="text-xs text-cyan-300">
                {user.rol_nombre || 'Sin rol'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-3 py-2">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-11 transition-all duration-200",
                        collapsed ? "px-2" : "px-4",
                        isActive 
                          ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border-r-2 border-cyan-400 shadow-lg" 
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 transition-colors duration-200", 
                        !collapsed && "mr-3",
                        isActive ? "text-cyan-400" : "text-slate-400"
                      )} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}