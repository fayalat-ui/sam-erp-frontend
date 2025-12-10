# Instrucciones de Configuración - Sistema de Control de Acceso

## Paso 1: Configurar Base de Datos en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/qznkrrcdvtubcwwldndo
2. Navega a "SQL Editor"
3. Copia y pega el contenido completo del archivo `database_setup.sql`
4. Ejecuta el script haciendo clic en "Run"

Este script creará:
- Tabla `tbl_usuarios` - Usuarios del sistema
- Tabla `tbl_roles` - Roles disponibles
- Tabla `tbl_permisos` - Permisos del sistema
- Tabla `tbl_rol_permisos` - Relación entre roles y permisos
- 3 roles predefinidos: Administrador, Supervisor, Operador
- Permisos para todos los módulos
- Políticas de seguridad RLS

## Paso 2: Crear tu Primer Usuario Administrador

1. En Supabase, ve a "Authentication" > "Users"
2. Haz clic en "Add user" > "Create new user"
3. Ingresa un email y contraseña
4. Haz clic en "Create user"

El usuario se creará automáticamente en la tabla `tbl_usuarios` gracias al trigger.

## Paso 3: Asignar Rol de Administrador

1. Ve a "SQL Editor" en Supabase
2. Ejecuta esta consulta (reemplaza el email con el tuyo):

```sql
UPDATE tbl_usuarios 
SET rol_id = (SELECT id FROM tbl_roles WHERE nombre = 'Administrador')
WHERE email = 'tu-email@ejemplo.com';
```

## Paso 4: Iniciar Sesión

1. Abre la aplicación
2. Usa el email y contraseña que creaste
3. Ahora tendrás acceso completo como Administrador

## Estructura de Permisos

### Roles Predefinidos:

**Administrador**
- Acceso completo a todos los módulos
- Puede crear, editar y eliminar en todos los módulos
- Puede gestionar usuarios y roles

**Supervisor**
- Puede ver, crear y editar en módulos operativos
- No puede eliminar registros
- No tiene acceso a gestión de usuarios y roles

**Operador**
- Solo puede ver información
- No puede crear, editar ni eliminar
- Acceso de solo lectura a todos los módulos

### Módulos del Sistema:

1. **Dashboard** - Vista general
2. **Trabajadores** - Gestión de personal
3. **Clientes** - Gestión de clientes
4. **Mandantes** - Gestión de mandantes
5. **Servicios** - Servicios de seguridad
6. **Contratos** - Contratos laborales
7. **Cursos** - Cursos OS10
8. **Vacaciones** - Solicitudes de vacaciones
9. **Usuarios** - Gestión de usuarios del sistema
10. **Roles** - Gestión de roles y permisos

### Acciones Disponibles:

- **view** - Ver/Listar registros
- **create** - Crear nuevos registros
- **edit** - Editar registros existentes
- **delete** - Eliminar registros

## Gestión de Usuarios y Roles

### Crear un Nuevo Usuario:

1. El usuario debe registrarse primero en Supabase Auth
2. Luego un Administrador puede asignarle un rol desde el módulo "Usuarios"
3. Los permisos se aplicarán automáticamente según el rol asignado

### Crear un Nuevo Rol:

1. Ve al módulo "Roles y Permisos"
2. Haz clic en "Nuevo Rol"
3. Ingresa nombre y descripción
4. Selecciona los permisos que tendrá el rol
5. Guarda los cambios

### Modificar Permisos de un Rol:

1. Ve al módulo "Roles y Permisos"
2. Haz clic en el botón de editar del rol
3. Marca o desmarca los permisos deseados
4. Guarda los cambios
5. Los usuarios con ese rol verán los cambios inmediatamente

## Seguridad

- Todas las tablas tienen Row Level Security (RLS) habilitado
- Los usuarios solo pueden ver su propia información
- Los administradores pueden ver y gestionar todos los usuarios
- Los permisos se verifican tanto en el frontend como en el backend
- Las políticas RLS protegen los datos a nivel de base de datos

## Solución de Problemas

**No puedo ver ningún módulo después de iniciar sesión:**
- Verifica que tu usuario tenga un rol asignado
- Verifica que el rol tenga permisos de "view" para los módulos

**No puedo crear/editar/eliminar:**
- Verifica que tu rol tenga los permisos correspondientes
- Solo los Administradores pueden gestionar usuarios y roles

**Error al cargar permisos:**
- Verifica que el script SQL se haya ejecutado correctamente
- Verifica que las tablas existan en Supabase
- Revisa la consola del navegador para más detalles