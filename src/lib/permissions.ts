export const MODULES = {
  DASHBOARD: 'dashboard',
  TRABAJADORES: 'trabajadores',
  CLIENTES: 'clientes',
  MANDANTES: 'mandantes',
  SERVICIOS: 'servicios',
  CONTRATOS: 'contratos',
  CURSOS: 'cursos',
  VACACIONES: 'vacaciones',
  USUARIOS: 'usuarios',
  ROLES: 'roles',
} as const;

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
} as const;

export type Module = typeof MODULES[keyof typeof MODULES];
export type Action = typeof ACTIONS[keyof typeof ACTIONS];

export interface PermissionCheck {
  modulo: Module;
  accion: Action;
}

export const MODULE_LABELS: Record<Module, string> = {
  [MODULES.DASHBOARD]: 'Dashboard',
  [MODULES.TRABAJADORES]: 'Trabajadores',
  [MODULES.CLIENTES]: 'Clientes',
  [MODULES.MANDANTES]: 'Mandantes',
  [MODULES.SERVICIOS]: 'Servicios',
  [MODULES.CONTRATOS]: 'Contratos',
  [MODULES.CURSOS]: 'Cursos OS10',
  [MODULES.VACACIONES]: 'Vacaciones',
  [MODULES.USUARIOS]: 'Usuarios',
  [MODULES.ROLES]: 'Roles y Permisos',
};

export const ACTION_LABELS: Record<Action, string> = {
  [ACTIONS.VIEW]: 'Ver',
  [ACTIONS.CREATE]: 'Crear',
  [ACTIONS.EDIT]: 'Editar',
  [ACTIONS.DELETE]: 'Eliminar',
};