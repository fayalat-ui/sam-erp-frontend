import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Shield
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  module?: string;
  level?: string;
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'RR.HH',
    icon: Users,
    module: 'rrhh',
    children: [
      {
        title: 'Trabajadores',
        href: '/trabajadores',
        icon: Users,
        module: 'rrhh',
        level: 'lectura'
      },
      {
        title: 'Vacaciones',
        href: '/vacaciones',
        icon: Calendar,
        module: 'rrhh',
        level: 'lectura'
      },
      {
        title: 'Jornadas',
        href: '/jornadas',
        icon: Calendar,
        module: 'rrhh',
        level: 'lectura'
      }
    ]
  },
  {
    title: 'Administradores',
    icon: Building2,
    module: 'administradores',
    children: [
      {
        title: 'Clientes',
        href: '/clientes',
        icon: Building2,
        module: 'administradores',
        level: 'lectura'
      },
      {
        title: 'Mandantes',
        href: '/mandantes',
        icon: Building2,
        module: 'administradores',
        level: 'lectura'
      }
    ]
  },
  {
    title: 'OSP',
    icon: Briefcase,
    module: 'osp',
    children: [
      {
        title: 'Servicios',
        href: '/servicios',
        icon: Briefcase,
        module: 'osp',
        level: 'lectura'
      },
      {
        title: 'Contratos',
        href: '/contratos',
        icon: FileText,
        module: 'osp',
        level: 'lectura'
      },
      {
        title: 'Cursos',
        href: '/cursos',
        icon: FileText,
        module: 'osp',
        level: 'lectura'
      },
      {
        title: 'Directivas',
        href: '/directivas',
        icon: FileText,
        module: 'osp',
        level: 'lectura'
      }
    ]
  },
  {
    title: 'Administración',
    icon: Settings,
    module: 'usuarios',
    children: [
      {
        title: 'Usuarios',
        href: '/usuarios',
        icon: User,
        module: 'usuarios',
        level: 'administracion'
      },
      {
        title: 'Roles',
        href: '/roles',
        icon: Settings,
        module: 'usuarios',
        level: 'administracion'
      }
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user, logout, canRead } = useSharePointAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['RR.HH', 'Administradores', 'OSP']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const canAccessItem = (item: NavItem): boolean => {
    if (!item.module) return true;
    return canRead(item.module);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!canAccessItem(item)) return null;

    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const accessibleChildren = item.children?.filter(canAccessItem) || [];

    if (hasChildren && accessibleChildren.length === 0) return null;

    if (hasChildren) {
      return (
        <div key={item.title} className="mb-1">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start px-3 py-2.5 h-auto font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200',
              depth > 0 && 'ml-4'
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <Icon className="mr-3 h-5 w-5 text-gray-600" />
            <span className="flex-1 text-left text-sm">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
              {accessibleChildren.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} to={item.href!} className="block mb-1">
        <Button
          variant={isActive(item.href!) ? 'default' : 'ghost'}
          className={cn(
            'w-full justify-start px-3 py-2.5 h-auto font-medium rounded-lg transition-all duration-200',
            depth > 0 && 'ml-4',
            isActive(item.href!) 
              ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <Icon className={cn(
            'mr-3 h-5 w-5',
            isActive(item.href!) ? 'text-white' : 'text-gray-600'
          )} />
          <span className="text-sm">{item.title}</span>
        </Button>
      </Link>
    );
  };

  return (
    <div className={cn('pb-12 min-h-screen bg-white border-r border-gray-200 shadow-sm', className)}>
      <div className="space-y-6 py-6">
        {/* Header */}
        <div className="px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">SAM ERP</h2>
              <p className="text-xs text-gray-500 font-medium">Sistema de Gestión</p>
            </div>
          </div>
          
          {/* User Info */}
          {user && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.nombre}</p>
                  <p className="text-xs text-gray-600 truncate">{user.rol_nombre}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="px-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-1">
              {navigation.map(item => renderNavItem(item))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Footer */}
        <div className="px-6 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2.5 h-auto font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span className="text-sm">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
}