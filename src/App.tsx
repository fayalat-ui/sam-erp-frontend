import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
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
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trabajadores"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Trabajadores />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Clientes />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandantes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Mandantes />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Servicios />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contratos"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Contratos />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cursos"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Cursos />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vacaciones"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Vacaciones />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Usuarios />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Roles />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;