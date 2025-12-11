# SAM ERP - Despliegue en Producción

## 🚀 Configuración de Producción

### 1. Configuración Azure AD (CRÍTICO)
En Azure Portal → App Registrations → tu aplicación, configura estas URLs de redirección:

**URLs de Redirección Requeridas:**
- `https://samerp.cl` (producción principal)
- `https://www.samerp.cl` (con www)
- `https://deploy-preview-*--samerp.netlify.app` (previews de Netlify)

### 2. Variables de Entorno en Netlify
Configura estas variables en Netlify Dashboard > Site Settings > Environment Variables:

```
VITE_AZURE_CLIENT_ID=4523a41a-818e-4d92-8775-1ccf155e7327
VITE_AZURE_TENANT_ID=2f7e4660-def9-427d-9c23-603e4e4dae55
VITE_REDIRECT_URI=https://samerp.cl
VITE_SHAREPOINT_SITE_URL=https://seguryservicios.sharepoint.com
VITE_SHAREPOINT_SITE_ID=/sites/root
```

### 3. Configuración de Dominio en Netlify
- Ve a Netlify Dashboard > Domain Settings
- Añade dominio personalizado: `samerp.cl`
- Configura DNS para apuntar a Netlify
- Habilita HTTPS automático

### 4. Comandos de Despliegue
```bash
# Build para producción
pnpm run build

# Preview local
pnpm run preview
```

### 5. Verificación de Datos SharePoint
- Ruta: `/test-data` - Prueba completa de todas las listas
- Ruta: `/test-sharepoint` - Prueba básica de conexión

### 6. Permisos SharePoint Requeridos
En Azure AD App Registration > API Permissions:
- User.Read
- Sites.Read.All
- Sites.ReadWrite.All  
- Files.ReadWrite.All

### 7. Listas SharePoint Mapeadas
- TBL_TRABAJADORES → Módulo RR.HH
- Tbl_Mandantes → Módulo Administradores
- TBL_SERVICIOS → Módulo OSP
- TBL_VACACIONES → Módulo RR.HH
- TBL_DIRECTIVAS → Módulo OSP
- TBL_USUARIOS → Administración

## 🔧 Troubleshooting

### Error AADSTS50011 (Redirect URI Mismatch)
**Solución:** Verificar que en Azure AD estén configuradas estas URLs:
- https://samerp.cl
- https://www.samerp.cl

### Error de Tenant ID
Verificar que el tenant ID coincida con tu organización Azure AD.

### Error de Permisos SharePoint
Asegurar que la app tenga permisos admin consent en Azure AD.

### Error de CORS
Verificar que las URLs de redirección estén configuradas correctamente en Azure AD.

## 📋 Checklist de Despliegue

- [ ] Configurar URLs de redirección en Azure AD
- [ ] Configurar variables de entorno en Netlify
- [ ] Configurar dominio personalizado samerp.cl
- [ ] Probar login en `/login`
- [ ] Verificar conexión SharePoint en `/test-data`
- [ ] Probar módulos: trabajadores, mandantes, servicios
- [ ] Verificar permisos por rol de usuario