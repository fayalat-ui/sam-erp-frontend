import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  Users, 
  Building2, 
  Briefcase, 
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  title: string;
  icon: any;
  href?: string;
  module?: string;
  level?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    title: 'RR.HH',
    icon: Users,
    module: 'rrhh',
    level: 'lectura',
    children: [
      { title: 'Trabajadores', icon: Users, href: '/trabajadores', module: 'rrhh', level: 'lectura' },
      { title: 'Vacaciones', icon: Calendar, href: '/vacaciones', module: 'rrhh', level: 'lectura' },
      { title: 'Jornadas', icon: Calendar, href: '/jornadas', module: 'rrhh', level: 'lectura' }
    ]
  },
  {
    title: 'Administradores',
    icon: Building2,
    module: 'administradores',
    level: 'lectura',
    children: [
      { title: 'Clientes', icon: Building2, href: '/clientes', module: 'administradores', level: 'lectura' },
      { title: 'Mandantes', icon: Building2, href: '/mandantes', module: 'administradores', level: 'lectura' }
    ]
  },
  {
    title: 'OSP',
    icon: Briefcase,
    module: 'osp',
    level: 'lectura',
    children: [
      { title: 'Servicios', icon: Briefcase, href: '/servicios', module: 'osp', level: 'lectura' },
      { title: 'Contratos', icon: FileText, href: '/contratos', module: 'osp', level: 'lectura' },
      { title: 'Cursos', icon: FileText, href: '/cursos', module: 'osp', level: 'lectura' },
      { title: 'Directivas', icon: FileText, href: '/directivas', module: 'osp', level: 'lectura' }
    ]
  },
  {
    title: 'Administración',
    icon: Settings,
    module: 'usuarios',
    level: 'administracion',
    children: [
      { title: 'Usuarios', icon: Users, href: '/usuarios', module: 'usuarios', level: 'administracion' },
      { title: 'Roles', icon: Settings, href: '/roles', module: 'usuarios', level: 'administracion' }
    ]
  }
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['RR.HH', 'Administradores', 'OSP']);
  const location = useLocation();
  const { user, logout, canRead, canAdmin } = useSharePointAuth();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const hasPermission = (item: MenuItem): boolean => {
    if (!item.module) return true;
    
    if (item.level === 'administracion') {
      return canAdmin(item.module);
    }
    
    return canRead(item.module);
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (!hasPermission(item)) return null;

    const isActive = item.href === location.pathname;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal",
              depth > 0 && "pl-8"
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <Icon className="h-4 w-4 mr-2" />
            <span className="flex-1">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} to={item.href!}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start text-left font-normal",
            depth > 0 && "pl-8"
          )}
        >
          <Icon className="h-4 w-4 mr-2" />
          {item.title}
        </Button>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SAM ERP</h2>
              <Badge variant="outline" className="text-xs">
                SharePoint
              </Badge>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName?.charAt(0) || user.mail?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || user.mail}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.jobTitle || 'Usuario'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}