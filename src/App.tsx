import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { SharePointAuthProvider } from '@/contexts/SharePointAuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Páginas base
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { LoginPage } from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// Módulos
import Trabajadores from './pages/Trabajadores';
import Clientes from './pages/Clientes';
import Mandantes from './pages/Mandantes';
import Servicios from './pages/Servicios';
import Contratos from './pages/Contratos';
import Cursos from './pages/Cursos';
import Vacaciones from './pages/Vacaciones';
import Jornadas from './pages/Jornadas';
import Directivas from './pages/Directivas';

// Administración
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';

// Utilidades
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

            {/* Ruta raíz: valida sesión y redirige */}
            <Route path="/" element={<Index />} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Diagnóstico SharePoint */}
            <Route path="/test-sharepoint" element={<TestSharePoint />} />

            {/* ===== MÓDULO RRHH ===== */}
            <Route
              path="/trabajadores/*"
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

            {/* ===== MÓDULO ADMINISTRADORES ===== */}
            <Route
              path="/clientes"
              element={
                <ProtectedRoute module="administradores" level="lectura">
                  <Client
