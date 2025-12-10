-- Script SQL para crear las tablas de control de acceso
-- Ejecutar este script en el SQL Editor de Supabase

BEGIN;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS tbl_usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  rol_id BIGINT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS tbl_roles (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS tbl_permisos (
  id BIGSERIAL PRIMARY KEY,
  modulo TEXT NOT NULL,
  accion TEXT NOT NULL,
  descripcion TEXT,
  UNIQUE(modulo, accion)
);

-- Tabla de relación rol-permisos
CREATE TABLE IF NOT EXISTS tbl_rol_permisos (
  id BIGSERIAL PRIMARY KEY,
  rol_id BIGINT NOT NULL REFERENCES tbl_roles(id) ON DELETE CASCADE,
  permiso_id BIGINT NOT NULL REFERENCES tbl_permisos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rol_id, permiso_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON tbl_usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON tbl_usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_rol_permisos_rol ON tbl_rol_permisos(rol_id);
CREATE INDEX IF NOT EXISTS idx_rol_permisos_permiso ON tbl_rol_permisos(permiso_id);

-- Insertar permisos básicos para todos los módulos
INSERT INTO tbl_permisos (modulo, accion, descripcion) VALUES
  ('dashboard', 'view', 'Ver dashboard'),
  ('trabajadores', 'view', 'Ver trabajadores'),
  ('trabajadores', 'create', 'Crear trabajadores'),
  ('trabajadores', 'edit', 'Editar trabajadores'),
  ('trabajadores', 'delete', 'Eliminar trabajadores'),
  ('clientes', 'view', 'Ver clientes'),
  ('clientes', 'create', 'Crear clientes'),
  ('clientes', 'edit', 'Editar clientes'),
  ('clientes', 'delete', 'Eliminar clientes'),
  ('mandantes', 'view', 'Ver mandantes'),
  ('mandantes', 'create', 'Crear mandantes'),
  ('mandantes', 'edit', 'Editar mandantes'),
  ('mandantes', 'delete', 'Eliminar mandantes'),
  ('servicios', 'view', 'Ver servicios'),
  ('servicios', 'create', 'Crear servicios'),
  ('servicios', 'edit', 'Editar servicios'),
  ('servicios', 'delete', 'Eliminar servicios'),
  ('contratos', 'view', 'Ver contratos'),
  ('contratos', 'create', 'Crear contratos'),
  ('contratos', 'edit', 'Editar contratos'),
  ('contratos', 'delete', 'Eliminar contratos'),
  ('cursos', 'view', 'Ver cursos'),
  ('cursos', 'create', 'Crear cursos'),
  ('cursos', 'edit', 'Editar cursos'),
  ('cursos', 'delete', 'Eliminar cursos'),
  ('vacaciones', 'view', 'Ver vacaciones'),
  ('vacaciones', 'create', 'Crear vacaciones'),
  ('vacaciones', 'edit', 'Editar vacaciones'),
  ('vacaciones', 'delete', 'Eliminar vacaciones'),
  ('usuarios', 'view', 'Ver usuarios'),
  ('usuarios', 'create', 'Crear usuarios'),
  ('usuarios', 'edit', 'Editar usuarios'),
  ('usuarios', 'delete', 'Eliminar usuarios'),
  ('roles', 'view', 'Ver roles'),
  ('roles', 'create', 'Crear roles'),
  ('roles', 'edit', 'Editar roles'),
  ('roles', 'delete', 'Eliminar roles')
ON CONFLICT (modulo, accion) DO NOTHING;

-- Crear roles predefinidos
INSERT INTO tbl_roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso completo a todos los módulos del sistema'),
  ('Supervisor', 'Acceso a gestión de trabajadores, servicios y reportes'),
  ('Operador', 'Acceso de solo lectura a módulos operativos')
ON CONFLICT (nombre) DO NOTHING;

-- Asignar todos los permisos al rol Administrador
INSERT INTO tbl_rol_permisos (rol_id, permiso_id)
SELECT 
  (SELECT id FROM tbl_roles WHERE nombre = 'Administrador'),
  id
FROM tbl_permisos
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Asignar permisos de visualización y edición al Supervisor
INSERT INTO tbl_rol_permisos (rol_id, permiso_id)
SELECT 
  (SELECT id FROM tbl_roles WHERE nombre = 'Supervisor'),
  id
FROM tbl_permisos
WHERE accion IN ('view', 'edit', 'create')
  AND modulo IN ('dashboard', 'trabajadores', 'servicios', 'contratos', 'cursos', 'vacaciones')
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Asignar permisos de solo lectura al Operador
INSERT INTO tbl_rol_permisos (rol_id, permiso_id)
SELECT 
  (SELECT id FROM tbl_roles WHERE nombre = 'Operador'),
  id
FROM tbl_permisos
WHERE accion = 'view'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en tbl_usuarios
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON tbl_usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON tbl_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear usuario automáticamente cuando se registra en auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tbl_usuarios (id, email, nombre, activo)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email), true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Habilitar RLS en todas las tablas
ALTER TABLE tbl_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_rol_permisos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tbl_usuarios
CREATE POLICY "Los usuarios pueden ver su propia información"
  ON tbl_usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los administradores pueden ver todos los usuarios"
  ON tbl_usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tbl_usuarios u
      JOIN tbl_roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'Administrador'
    )
  );

CREATE POLICY "Los administradores pueden actualizar usuarios"
  ON tbl_usuarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tbl_usuarios u
      JOIN tbl_roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'Administrador'
    )
  );

-- Políticas RLS para tbl_roles (solo lectura para todos los autenticados)
CREATE POLICY "Los usuarios autenticados pueden ver roles"
  ON tbl_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los administradores pueden gestionar roles"
  ON tbl_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tbl_usuarios u
      JOIN tbl_roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'Administrador'
    )
  );

-- Políticas RLS para tbl_permisos (solo lectura para todos los autenticados)
CREATE POLICY "Los usuarios autenticados pueden ver permisos"
  ON tbl_permisos FOR SELECT
  TO authenticated
  USING (true);

-- Políticas RLS para tbl_rol_permisos
CREATE POLICY "Los usuarios autenticados pueden ver rol_permisos"
  ON tbl_rol_permisos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los administradores pueden gestionar rol_permisos"
  ON tbl_rol_permisos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tbl_usuarios u
      JOIN tbl_roles r ON u.rol_id = r.id
      WHERE u.id = auth.uid() AND r.nombre = 'Administrador'
    )
  );

COMMIT;