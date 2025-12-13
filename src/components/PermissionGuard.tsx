import { useAuth } from '@/contexts/AuthContext';
import { Module, Action } from '@/lib/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  modulo: Module;
  accion: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ modulo, accion, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(modulo, accion)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="bg-slate-900 border-slate-800">
        <ShieldAlert className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-slate-300">
          No tienes permisos para realizar esta acción
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}