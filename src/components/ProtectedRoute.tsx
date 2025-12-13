import { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSharePointAuth } from "@/contexts/SharePointAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  module?: string;
  level?: string;
}

export function ProtectedRoute({ children, module, level }: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useSharePointAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No hay sesión => login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere permisos por módulo/nivel y no los tiene
  if (module && level && !hasPermission(module, level)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso denegado</h2>
            <p className="text-gray-600">
              Tu usuario no tiene permisos para entrar a esta sección.
            </p>

            <div className="text-sm text-gray-500 mt-3 space-y-1">
              <div>
                <span className="font-medium">Módulo:</span>{" "}
                <span className="font-medium">{module}</span>
              </div>
              <div>
                <span className="font-medium">Nivel requerido:</span>{" "}
                <span className="font-medium">{level}</span>
              </div>
              <div className="pt-2">
                <span className="font-medium">Usuario:</span>{" "}
                <span className="font-medium">
                  {user.userPrincipalName || user.mail || user.displayName}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <Home className="h-4 w-4 mr-2" />
                Ir al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
