import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-blue-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-slate-100">ERP Seguridad</h1>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            <span className="text-slate-400">Cargando sistema...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirigir según el estado de autenticación
  if (user) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}