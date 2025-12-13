import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-sm">Bienvenido</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="h-5 w-5" />
          <span className="text-sm">{user?.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}