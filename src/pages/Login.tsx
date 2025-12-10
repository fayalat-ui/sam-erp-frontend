import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const { user, login, isLoading } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciales inválidas o usuario inactivo');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setEmail('admin@samerp.cl');
    setPassword('admin123');
    
    try {
      const success = await login('admin@samerp.cl', 'admin123');
      if (!success) {
        setError('Usuario demo no configurado. Necesitas crear el usuario en Supabase.');
        setShowDemo(true);
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      setShowDemo(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-100">
              ERP Seguridad
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <Alert className="bg-red-900/50 border-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                🚀 Probar con Usuario Demo
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-2">
              ℹ️ Información de acceso:
            </h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Usa el botón "Usuario Demo" para probar</li>
              <li>• O crea un usuario en Supabase Authentication</li>
              <li>• Asegúrate de ejecutar el script SQL completo</li>
            </ul>
          </div>

          {showDemo && (
            <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-300 mb-2">
                🔧 Para configurar usuario demo:
              </h4>
              <ol className="text-xs text-yellow-200 space-y-1 list-decimal list-inside">
                <li>Ve a Supabase Dashboard → Authentication → Users</li>
                <li>Crea usuario: admin@samerp.cl / admin123</li>
                <li>Copia el UUID generado</li>
                <li>Ejecuta en SQL Editor:</li>
              </ol>
              <code className="block mt-2 p-2 bg-slate-800 text-xs text-green-300 rounded">
                INSERT INTO tbl_usuarios (id, email, nombre, rol_id, activo)<br/>
                VALUES ('UUID_COPIADO', 'admin@samerp.cl', 'Administrador', 1, true);
              </code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}