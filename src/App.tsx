import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SharePointAuthProvider } from '@/contexts/SharePointAuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { LoginPage } from './pages/LoginPage';
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

import TestSharePoint from './pages/TestSharePoint';
import MigrationNotice from './pages/_MigrationNotice';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SharePointAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta raíz como en el inicio: Index hace verificación y redirige a login/dashboard */}
            <Route path="/" element={<Index />} />

            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Página de diagnóstico SharePoint disponible, pero no es la ruta por defecto */}
            <Route path="/test-sharepoint" element={<TestSharePoint />} />

            {/* Módulo RR.HH (protegido) */}
            <Route
              path="/trabajadores"
              element={
                <ProtectedRoute module="rrhh" level="lectura">
                  <Trabajadores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vacaciones"
              element={
                <ProtectedRoute module="rrhh" level="lectura">
                  <Vacaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jornadas"
              element={
                <ProtectedRoute module="rrhh" level="lectura">
                  <Jornadas />
                </ProtectedRoute>
              }
            />

            {/* Módulo Administradores */}
            <Route
              path="/clientes"
              element={
                <ProtectedRoute module="administradores" level="lectura">
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandantes"
              element={
                <ProtectedRoute module="administradores" level="lectura">
                  <Mandantes />
                </ProtectedRoute>
              }
            />

            {/* Módulo OSP */}
            <Route
              path="/servicios"
              element={
                <ProtectedRoute module="osp" level="lectura">
                  <Servicios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contratos"
              element={
                <ProtectedRoute module="osp" level="lectura">
                  <Contratos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cursos"
              element={
                <ProtectedRoute module="osp" level="lectura">
                  <Cursos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/directivas"
              element={
                <ProtectedRoute module="osp" level="lectura">
                  <Directivas />
                </ProtectedRoute>
              }
            />

            {/* Administración de Usuarios */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute module="usuarios" level="administracion">
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute module="usuarios" level="administracion">
                  <Roles />
                </ProtectedRoute>
              }
            />

            {/* Placeholders para módulos en migración (protegidos) */}
            <Route
              path="/proveedores"
              element={
                <ProtectedRoute module="administradores" level="lectura">
                  <MigrationNotice title="Proveedores en migración" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute module="administradores" level="lectura">
                  <MigrationNotice title="Inventario en migración" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRoute module="administradores" level="lectura">
                  <MigrationNotice title="Ventas en migración" />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SharePointAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;