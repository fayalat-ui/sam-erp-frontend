import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';
import { Shield, Building2, Users, FileText, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { user, login, isLoading } = useSharePointAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Error durante el login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SAM ERP</h1>
          <p className="text-gray-600">Sistema de Administración y Gestión</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600">
              Accede con tu cuenta de Microsoft Office 365
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Iniciar Sesión con Microsoft
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Recursos Humanos</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Administración</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Gestión OSP</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 SAM ERP. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}