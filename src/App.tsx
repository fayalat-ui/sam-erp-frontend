import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trabajadores from './pages/Trabajadores';
import Clientes from './pages/Clientes';
import Mandantes from './pages/Mandantes';
import Servicios from './pages/Servicios';
import Contratos from './pages/Contratos';
import Cursos from './pages/Cursos';
import Vacaciones from './pages/Vacaciones';
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';
import Directivas from './pages/Directivas';
import Jornadas from './pages/Jornadas';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/trabajadores" element={
              <ProtectedRoute>
                <Trabajadores />
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            } />
            <Route path="/mandantes" element={
              <ProtectedRoute>
                <Mandantes />
              </ProtectedRoute>
            } />
            <Route path="/servicios" element={
              <ProtectedRoute>
                <Servicios />
              </ProtectedRoute>
            } />
            <Route path="/contratos" element={
              <ProtectedRoute>
                <Contratos />
              </ProtectedRoute>
            } />
            <Route path="/cursos" element={
              <ProtectedRoute>
                <Cursos />
              </ProtectedRoute>
            } />
            <Route path="/vacaciones" element={
              <ProtectedRoute>
                <Vacaciones />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            } />
            <Route path="/roles" element={
              <ProtectedRoute>
                <Roles />
              </ProtectedRoute>
            } />
            <Route path="/directivas" element={
              <ProtectedRoute>
                <Directivas />
              </ProtectedRoute>
            } />
            <Route path="/jornadas" element={
              <ProtectedRoute>
                <Jornadas />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;