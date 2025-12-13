# ERP Sistema de Gestión de Servicios de Seguridad - Plan de Desarrollo

## Diseño Visual

### Referencias de Diseño
- **Estilo**: Dashboard Administrativo Moderno con tema oscuro
- **Inspiración**: Sistemas ERP profesionales como SAP, Odoo
- **Paleta de colores**: Tema oscuro profesional con acentos azules

### Paleta de Colores
- Primary: #3B82F6 (Azul - acciones principales)
- Secondary: #1E293B (Gris oscuro - fondo secundario)
- Background: #0F172A (Azul oscuro profundo - fondo principal)
- Surface: #1E293B (Tarjetas y paneles)
- Accent: #10B981 (Verde - estados positivos)
- Warning: #F59E0B (Amarillo - alertas)
- Error: #EF4444 (Rojo - errores y estados críticos)
- Text Primary: #F8FAFC (Blanco)
- Text Secondary: #94A3B8 (Gris claro)

### Tipografía
- Heading1: Inter font-weight 700 (32px)
- Heading2: Inter font-weight 600 (24px)
- Heading3: Inter font-weight 600 (20px)
- Body/Normal: Inter font-weight 400 (14px)
- Body/Emphasis: Inter font-weight 600 (14px)
- Navigation: Inter font-weight 500 (14px)

### Componentes Clave
- **Sidebar**: Fondo #1E293B, items hover #334155, active con borde izquierdo azul
- **Cards**: Fondo #1E293B, borde sutil #334155, sombra suave, border-radius 8px
- **Buttons**: Primary azul #3B82F6, hover más brillante, border-radius 6px
- **Tables**: Filas alternadas con hover, headers con fondo #334155
- **Forms**: Inputs con fondo #0F172A, borde #334155, focus borde azul

### Layout
- Sidebar fijo a la izquierda (240px)
- Header superior con breadcrumbs y perfil de usuario
- Contenido principal con padding 24px
- Grid responsivo: 12 columnas desktop, 6 tablet, 4 mobile

## Imágenes a Generar
1. **logo-empresa.png** - Logo de empresa de seguridad, escudo con iniciales, estilo profesional (Style: vector-style, transparent background)
2. **default-avatar.jpg** - Avatar por defecto para trabajadores, silueta profesional (Style: minimalist, neutral colors)
3. **dashboard-hero.jpg** - Imagen hero para dashboard, equipo de seguridad profesional (Style: photorealistic, corporate)

---

## Estructura de Base de Datos Existente

### Tablas Principales:
1. **tbl_trabajadores** - Datos personales, contacto, estado laboral, foto
2. **tbl_clientes** - RUT, razón social, contacto
3. **tbl_mandantes** - Información completa del mandante, logo, firma
4. **tbl_servicios** - Servicios de seguridad, ubicación, guardias, supervisor
5. **tbl_solicitud_contratos** - Contratos con detalles de cargo, jornada, remuneraciones
6. **tbl_registro_cursos_os10** - Cursos de capacitación, vigencia
7. **tbl_vacaciones** - Solicitudes y seguimiento de vacaciones
8. **tbl_directivas** - Directivas de servicios con documentación
9. **tbl_cargos** - Catálogo de cargos y roles
10. **tbl_autoridad_fiscalizadora** - Autoridades fiscalizadoras

---

## Tareas de Desarrollo

### 1. Configuración Inicial y Estructura Base
- Instalar dependencias de Supabase: `pnpm install @supabase/supabase-js`
- Crear archivo de configuración de Supabase: `src/lib/supabase.ts`
- Crear tipos TypeScript para todas las tablas: `src/types/database.ts`
- Actualizar título en `index.html` a "ERP Gestión de Seguridad"

### 2. Sistema de Autenticación
- Crear contexto de autenticación: `src/contexts/AuthContext.tsx`
- Crear página de login: `src/pages/Login.tsx`
- Crear componente de protección de rutas: `src/components/ProtectedRoute.tsx`
- Implementar login/logout con Supabase Auth

### 3. Layout Principal y Navegación
- Crear layout principal con sidebar: `src/components/layout/MainLayout.tsx`
- Crear sidebar con navegación: `src/components/layout/Sidebar.tsx`
- Crear header con breadcrumbs: `src/components/layout/Header.tsx`
- Configurar rutas en `src/App.tsx`

### 4. Dashboard Principal (Tarea 1)
- Crear página dashboard: `src/pages/Dashboard.tsx`
- Componente de tarjetas de estadísticas: `src/components/dashboard/StatCard.tsx`
- Gráfico de trabajadores por estado: `src/components/dashboard/WorkersChart.tsx`
- Lista de próximos vencimientos de cursos: `src/components/dashboard/UpcomingCourses.tsx`
- Servicios activos recientes: `src/components/dashboard/ActiveServices.tsx`

### 5. Módulo de Trabajadores (Tarea 2)
- Página principal trabajadores: `src/pages/Trabajadores.tsx`
- Tabla de trabajadores con búsqueda y filtros: `src/components/trabajadores/WorkersTable.tsx`
- Modal de detalle de trabajador: `src/components/trabajadores/WorkerDetail.tsx`
- Formulario crear/editar trabajador: `src/components/trabajadores/WorkerForm.tsx`
- Vista de foto y documentos: `src/components/trabajadores/WorkerDocuments.tsx`

### 6. Módulo de Clientes y Mandantes (Tarea 3)
- Página de clientes: `src/pages/Clientes.tsx`
- Página de mandantes: `src/pages/Mandantes.tsx`
- Tabla de clientes: `src/components/clientes/ClientesTable.tsx`
- Tabla de mandantes: `src/components/mandantes/MandantesTable.tsx`
- Formulario de cliente: `src/components/clientes/ClienteForm.tsx`
- Formulario de mandante: `src/components/mandantes/MandanteForm.tsx`

### 7. Módulo de Servicios (Tarea 4)
- Página de servicios: `src/pages/Servicios.tsx`
- Tabla de servicios: `src/components/servicios/ServiciosTable.tsx`
- Detalle de servicio con directivas: `src/components/servicios/ServicioDetail.tsx`
- Formulario de servicio: `src/components/servicios/ServicioForm.tsx`
- Asignación de guardias: `src/components/servicios/GuardiasAssignment.tsx`

### 8. Módulo de Contratos (Tarea 5)
- Página de contratos: `src/pages/Contratos.tsx`
- Tabla de contratos: `src/components/contratos/ContratosTable.tsx`
- Formulario de solicitud de contrato: `src/components/contratos/ContratoForm.tsx`
- Vista de detalle de contrato: `src/components/contratos/ContratoDetail.tsx`
- Gestión de documentos adjuntos: `src/components/contratos/ContratoDocuments.tsx`

### 9. Módulo de Cursos OS10 (Tarea 6)
- Página de cursos: `src/pages/Cursos.tsx`
- Tabla de cursos con alertas de vencimiento: `src/components/cursos/CursosTable.tsx`
- Formulario de registro de curso: `src/components/cursos/CursoForm.tsx`
- Vista de documentos de curso: `src/components/cursos/CursoDocuments.tsx`

### 10. Módulo de Vacaciones (Tarea 7)
- Página de vacaciones: `src/pages/Vacaciones.tsx`
- Calendario de vacaciones: `src/components/vacaciones/VacacionesCalendar.tsx`
- Tabla de solicitudes: `src/components/vacaciones/VacacionesTable.tsx`
- Formulario de solicitud: `src/components/vacaciones/VacacionForm.tsx`
- Aprobación de vacaciones: `src/components/vacaciones/VacacionApproval.tsx`

### 11. Componentes Compartidos
- Componente de búsqueda: `src/components/common/SearchBar.tsx`
- Componente de filtros: `src/components/common/FilterPanel.tsx`
- Componente de paginación: `src/components/common/Pagination.tsx`
- Componente de estado badge: `src/components/common/StatusBadge.tsx`
- Componente de carga de archivos: `src/components/common/FileUpload.tsx`

### 12. Utilidades y Helpers
- Funciones de formato de fecha: `src/lib/dateUtils.ts`
- Funciones de formato de RUT: `src/lib/rutUtils.ts`
- Funciones de validación: `src/lib/validation.ts`
- Hooks personalizados: `src/hooks/useDebounce.ts`, `src/hooks/useTable.ts`

### 13. Estilos y Temas
- Configurar tema oscuro en `src/index.css`
- Estilos personalizados para tablas y formularios
- Animaciones y transiciones suaves

### 14. Testing y Optimización
- Verificar funcionamiento de todos los módulos
- Optimizar consultas a Supabase
- Implementar lazy loading de componentes
- Verificar responsividad en diferentes dispositivos

### 15. Build y Deployment
- Ejecutar `pnpm run lint` para verificar código
- Ejecutar `pnpm run build` para compilar
- Verificar que no hay errores de TypeScript