import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { MODULES, ACTIONS } from '@/lib/permissions';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol_id: number;
  rol_nombre: string;
  activo: boolean;
  permisos: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión existente
    checkSession();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Obtener datos del usuario con rol y permisos
      const { data: userData, error: userError } = await supabase
        .from('tbl_usuarios')
        .select(`
          id,
          email,
          nombre,
          rol_id,
          activo,
          tbl_roles!inner (
            nombre
          )
        `)
        .eq('id', userId)
        .eq('activo', true)
        .single();

      if (userError) {
        console.error('Error loading user data:', userError);
        return;
      }

      if (!userData) {
        console.error('Usuario no encontrado en tbl_usuarios');
        await supabase.auth.signOut();
        return;
      }

      // Obtener permisos del rol
      const { data: permisos, error: permisosError } = await supabase
        .from('tbl_rol_permisos')
        .select(`
          tbl_permisos!inner (
            modulo,
            accion
          )
        `)
        .eq('rol_id', userData.rol_id);

      if (permisosError) {
        console.error('Error loading permissions:', permisosError);
        return;
      }

      const userPermisos = permisos?.map(p => `${p.tbl_permisos.modulo}.${p.tbl_permisos.accion}`) || [];

      const userSession: User = {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre || userData.email,
        rol_id: userData.rol_id,
        rol_nombre: userData.tbl_roles.nombre,
        activo: userData.activo,
        permisos: userPermisos
      };

      setUser(userSession);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        await loadUserData(data.user.id);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login exception:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!user || !user.permisos) return false;
    
    // Los administradores tienen acceso completo
    if (user.rol_id === 1) return true;
    
    // Verificar permiso específico
    return user.permisos.includes(`${module}.${action}`);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}