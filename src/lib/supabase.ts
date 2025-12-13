import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qznkrrcdvtubcwwldndo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bmtycmNkdnR1YmN3d2xkbmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTA0OTAsImV4cCI6MjA3NzE4NjQ5MH0.7HZ60y8Lkn8HTUAqm6lITkaTQD7HkKkiAExDUdFzXyg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Función para verificar la conexión
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('tbl_usuarios').select('count').limit(1);
    if (error) throw error;
    return { success: true, message: 'Conexión exitosa' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, message: errorMessage };
  }
};

// Función para obtener datos sin autenticación (para tablas públicas)
export const getPublicData = async (table: string, select: string = '*') => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(select);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return { data: null, error: errorMessage };
  }
};