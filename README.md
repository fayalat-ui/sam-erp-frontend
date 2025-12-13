# SAM ERP Frontend (SharePoint + Graph + MSAL)

Single Page Application built with React + Vite + shadcn/ui. Auth via Microsoft Entra ID (MSAL), data from SharePoint Online via Microsoft Graph. Ready to deploy to Netlify under samerp.cl.

## 1. Infraestructura y dominio

- SPA moderna (React + Vite), desplegable en Netlify.
- Código compatible con GitHub.
- Preparado para funcionar bajo el dominio https://samerp.cl (o URL de Netlify si usas dominio temporal).

## 2. Autenticación y permisos (Microsoft / SharePoint)

- Autenticación con Microsoft Entra ID (Azure AD) usando OAuth2/OIDC mediante MSAL.
- Acceso a SharePoint Online a través de Microsoft Graph.
- Client ID, Tenant ID y Redirect URI configurables por variables de entorno.

Archivos clave:
- src/lib/msalConfig.ts (parametrizado por env)
- src/contexts/SharePointAuthContext.tsx (gestión de sesión y permisos básicos)

Scopes solicitados:
- Por defecto: `User.Read`, `Sites.Read.All`
- Puedes personalizar los scopes con `VITE_AZURE_SCOPES` (separados por coma o espacios), por ejemplo:
  - `User.Read,Sites.Read.All,Sites.ReadWrite.All`
  - Nota: Scopes ampliados pueden requerir consentimiento de administrador.

## 3. Conexión a SharePoint (API)

- Conexión vía Microsoft Graph API.
- Soporte para inicializar por SITE_ID o por HOSTNAME + SITE_PATH.
- List IDs parametrizables por env, con fallback por `displayName`.

Archivo clave:
- src/lib/sharepoint.ts
  - initializeSite(): usa VITE_SHAREPOINT_SITE_ID o VITE_SHAREPOINT_HOSTNAME + VITE_SHAREPOINT_SITE_PATH
  - getListItems(nameOrId, select?, filter?, orderBy?, top?): lectura de elementos
  - create/update/delete: operaciones CRUD
  - Resolución de listas:
    - Usa ID desde variables VITE_SP_LIST_*_ID si está disponible
    - Si no, busca por displayName (p. ej., "TBL_TRABAJADORES") y cachea el ID

## 4. Módulos iniciales

- Trabajadores (TBL_TRABAJADORES): tabla, búsqueda por nombre/RUT, vista detalle básica
- Clientes (TBL_CLIENTES): tabla con columnas clave, búsqueda
- Servicios (TBL_SERVICIOS): tabla con cliente/ubicación/dotación/estado, filtros por cliente/estado

Rutas principales (protegidas según módulo):
- /dashboard, /trabajadores, /clientes, /servicios
- Página de diagnóstico: /test-sharepoint (para pruebas)

## 5. UI / UX

- Interfaz corporativa, con navegación a módulos (menú lateral en la app).
- Responsive básico.

## 6. Configuración y variables de entorno

Crea un archivo `.env` basado en `.env.example`:

General
- REACT_APP_GITHUB_REPO (opcional, URL del repo GitHub)

Azure AD / MSAL
- VITE_AZURE_CLIENT_ID
- VITE_AZURE_TENANT_ID
- VITE_AZURE_REDIRECT_URI (recomendado; debe coincidir EXACTAMENTE con el Redirect URI registrado en Azure, por ejemplo `https://samerp.cl/login`)
- VITE_REDIRECT_URI (fallback si no defines el anterior)
- VITE_AZURE_SCOPES (p. ej., `User.Read,Sites.Read.All`)

SharePoint
- VITE_SHAREPOINT_SITE_ID (recomendado) o:
- VITE_SHAREPOINT_HOSTNAME (p. ej., contoso.sharepoint.com)
- VITE_SHAREPOINT_SITE_PATH (p. ej., /sites/sam)
- List IDs:
  - VITE_SP_LIST_TRABAJADORES_ID
  - VITE_SP_LIST_CLIENTES_ID
  - VITE_SP_LIST_SERVICIOS_ID
  - VITE_SP_LIST_MANDANTES_ID
  - VITE_SP_LIST_VACACIONES_ID
  - VITE_SP_LIST_DIRECTIVAS_ID

Supabase (si aplica)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## 7. Puesta en marcha local

1) Copia `.env.example` a `.env` y completa valores.
2) Instala dependencias: `pnpm i`
3) Ejecuta en dev: `pnpm run dev`
4) Lint y build: `pnpm run lint && pnpm run build`

## 8. Despliegue en Netlify

Opción A (recomendada): desde la UI
- New site from Git → GitHub → selecciona el repo
- Build command: `pnpm run build`
- Publish directory: `dist`
- Node: 18 (también definido en netlify.toml)
- Configura variables de entorno (sección 6)
- Si usarás samerp.cl, configura custom domain en Netlify y añade `https://samerp.cl/login` (o el que definas) como Redirect URI en Azure

Opción B (CLI): requiere NETLIFY_AUTH_TOKEN y SITE_ID.

El proyecto incluye `netlify.toml` con redirect para SPA (/* → /index.html).

## 9. Notas de seguridad

- No commitear `.env` ni credenciales.
- Registrar siempre el Redirect URI exacto en Azure (coincidente con el dominio real).
- Usar IDs de listas en producción para mayor robustez.
- Evita poner tokens en la URL del remoto Git; utiliza SSH o GitHub CLI.

## 10. Pasos en Azure para evitar AADSTS50011

1) Azure Portal → Azure Active Directory → App registrations → tu app (`4523a41a-818e-4d92-8775-1ccf155e7327`) → Authentication.
2) En “Single-page application (SPA)”, agrega:
   - Producción: `https://samerp.cl/login` (recomendado)
   - Netlify (si usas dominio temporal): `https://<tu-sitio>.netlify.app/login`
   - Desarrollo local: `http://localhost:5173/login`
3) Guarda cambios y espera propagación (puede tardar algunos minutos).
4) Asegúrate de que `VITE_AZURE_REDIRECT_URI` en Netlify coincide EXACTAMENTE con uno de los URIs registrados.

## 11. Roadmap sugerido

- Filtros/orden estable por módulo (ej.: estado=Activo, ordenar por nombre ASC).
- Mejorar vistas detalle y paginación.
- Refinar permisos por módulo desde una lista/tabla en SharePoint.