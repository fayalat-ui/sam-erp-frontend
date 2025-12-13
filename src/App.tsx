import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SharePointAuthProvider } from "@/contexts/SharePointAuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Páginas base
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

// Módulos
import Trabajadores from "./pages/Trabajadores";
import Clientes from "./pages/Clientes";
import Mandantes from "./pages/Mandantes";
import Servicios from "./pages/Servicios";
import Contratos from "./pages/Contratos";
import Cursos from "./pages/Cursos";
import Vacaciones from "./pages/Vacaciones";
import Jornadas from "./pages/Jornadas";
import Directivas from "./pages/Directivas";

// Administración
import Usuarios from "./pages/Usuarios";
import Roles from "./pages/Roles";

// Utilidades
import TestSharePoint from "./pages/TestSharePoint";
import MigrationNotice from "./pages/_MigrationNotice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SharePointAuthProvider>
        {/* ✅ Wrapper global: tema + layout moderno */}
        <div className="min-h-screen bg-background text-foreground">
          {/* ✅ Fondo suave + contenedor centrado */}
          <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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

                  {/* ===== MÓDULO OSP ===== */}
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

                  {/* ===== ADMINISTRACIÓN DE USUARIOS ===== */}
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

                  {/* ===== MÓDULOS EN MIGRACIÓN ===== */}
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

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </div>
        </div>
      </SharePointAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
