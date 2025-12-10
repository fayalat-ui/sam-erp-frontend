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
      "pb-12 border-r bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="space-y-4 py-4">
        {/* Header */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                SAMERP
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0"
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
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user.nombre}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {user.tbl_roles?.nombre || 'Sin rol'}
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
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10",
                        collapsed ? "px-2" : "px-4",
                        isActive && "bg-slate-200 dark:bg-slate-700"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                      {!collapsed && (
                        <span className="text-sm">{item.title}</span>
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