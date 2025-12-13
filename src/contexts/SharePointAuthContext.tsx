import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AccountInfo } from "@azure/msal-browser";
import { msalInstance } from "@/auth/msalInstance";
import { loginRequest } from "@/auth/msalConfig";
import { getAccessToken as coreGetAccessToken } from "@/auth/authService";
import { sharePointClient } from "@/lib/sharepoint";

type Permisos = Record<string, string[]>;

interface SharePointUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  permisos: Permisos;
}

interface SharePointAuthContextType {
  user: SharePointUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;

  hasPermission: (module: string, level: string) => boolean;
  canRead: (module: string) => boolean;
  canWrite: (module: string) => boolean;
  canAdmin: (module: string) => boolean;

  isSystemAdmin: boolean;

  reloadPermissions: () => Promise<void>;
}

const SharePointAuthContext =
  createContext<SharePointAuthContextType | undefined>(undefined);

const PERMS_LIST = "TBL_USUARIOS_PERMISOS";

// Env opcional (respaldo): lista de UPNs admin del sistema
const SYSTEM_ADMIN_UPNS = (
  (import.meta.env.VITE_SYSTEM_ADMIN_UPNS as string | undefined) || ""
)
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function ensureArrayStrings(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function normalizePerms(p?: Permisos): Permisos {
  const modules = ["rrhh", "administradores", "osp", "usuarios"];
  const out: Permisos = {};
  for (const m of modules) out[m] = [];
  if (!p) return out;

  for (const m of modules) {
    out[m] = Array.isArray(p[m]) ? p[m].filter((x) => typeof x === "string") : [];
  }
  return out;
}

function defaultPermisos(systemAdmin: boolean): Permisos {
  return normalizePerms({
    rrhh: ["lectura"],
    administradores: ["lectura"],
    osp: ["lectura"],
    usuarios: systemAdmin ? ["lectura", "escritura", "administracion"] : ["lectura"],
  });
}

async function fetchPermsFromSharePoint(upn: string): Promise<{
  found: boolean;
  isSystemAdmin: boolean;
  permisos: Permisos;
}> {
  // Seleccionamos SOLO lo necesario (rápido)
  const select =
    "Title,USR_IS_SYSTEM_ADMIN,PERM_RRHH,PERM_ADMINISTRADORES,PERM_OSP,PERM_USUARIOS,USR_ESTADO";

  // IMPORTANTE: $filter por fields no siempre funciona en Graph según tenant/lista,
  // así que hacemos top grande y filtramos en cliente (robusto y sin sorpresas).
  const items = await sharePointClient.getListItems(PERMS_LIST, select, undefined, undefined, 999);

  const target = items.find((it: any) => {
    const f = it?.fields || {};
    const title = String(f.Title || "").toLowerCase().trim();
    return title === upn.toLowerCase().trim();
  });

  if (!target) {
    return { found: false, isSystemAdmin: false, permisos: normalizePerms() };
  }

  const f = target.fields || {};

  // Si está inactivo, lo tratamos como sin permisos (tú decides si quieres otra lógica)
  const estado = String(f.USR_ESTADO || "").toLowerCase().trim();
  const inactive = estado === "inactivo";

  const isSys = Boolean(f.USR_IS_SYSTEM_ADMIN) && !inactive;

  const permisos = inactive
    ? normalizePerms()
    : normalizePerms({
        rrhh: ensureArrayStrings(f.PERM_RRHH),
        administradores: ensureArrayStrings(f.PERM_ADMINISTRADORES),
        osp: ensureArrayStrings(f.PERM_OSP),
        usuarios: ensureArrayStrings(f.PERM_USUARIOS),
      });

  return { found: true, isSystemAdmin: isSys, permisos };
}

export function SharePointAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SharePointUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

  useEffect(() => {
    void initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeAuth = async () => {
    try {
      await msalInstance.initialize();
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        const account = accounts[0] as AccountInfo;
        msalInstance.setActiveAccount(account);
        setIsAuthenticated(true);
        await loadUserProfile(account);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error initializing MSAL:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (account: AccountInfo) => {
    try {
      const token = await coreGetAccessToken();

      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener el perfil: ${response.status}`);
      }

      const profile = await response.json();

      const upn = String(profile.userPrincipalName || "").toLowerCase().trim();
      const jobTitle = String(profile.jobTitle || "");
      const byTitle =
        jobTitle.toLowerCase().includes("admin") ||
        jobTitle.toLowerCase().includes("jefe");
      const byList = upn && SYSTEM_ADMIN_UPNS.includes(upn);

      // 1) Intentamos permisos reales desde SharePoint
      let spFound = false;
      let spIsSys = false;
      let spPerms: Permisos = normalizePerms();

      try {
        const sp = await fetchPermsFromSharePoint(upn);
        spFound = sp.found;
        spIsSys = sp.isSystemAdmin;
        spPerms = sp.permisos;
      } catch (e) {
        console.warn("No se pudo leer permisos desde SharePoint (se usa fallback):", e);
      }

      // 2) Si hay registro en SP, manda SP.
      // 3) Si no hay registro, fallback conservador: lectura en todo + admin en usuarios si corresponde.
      const fallbackIsSys = Boolean(byTitle || byList);
      const finalIsSys = spFound ? spIsSys : fallbackIsSys;

      const permisosFinal = spFound
        ? spPerms
        : defaultPermisos(fallbackIsSys);

      setIsSystemAdmin(finalIsSys);

      const userData: SharePointUser = {
        id: profile.id,
        displayName: profile.displayName,
        mail: profile.mail,
        userPrincipalName: profile.userPrincipalName,
        jobTitle: profile.jobTitle,
        department: profile.department,
        permisos: permisosFinal,
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsSystemAdmin(false);
    }
  };

  const login = async () => {
    try {
      const result = await msalInstance.loginPopup(loginRequest);
      if (result.account) {
        msalInstance.setActiveAccount(result.account);
        setIsAuthenticated(true);
        await loadUserProfile(result.account as AccountInfo);
      }
    } catch (error) {
      console.error("Error en login MSAL:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsSystemAdmin(false);
    }
  };

  const getAccessToken = async () => coreGetAccessToken();

  const hasPermission = (module: string, level: string) => {
    if (!user) return false;
    const permisosModulo = user.permisos[module] || [];
    return permisosModulo.includes(level);
  };

  const canRead = (module: string) => hasPermission(module, "lectura");
  const canWrite = (module: string) => hasPermission(module, "escritura");
  const canAdmin = (module: string) => hasPermission(module, "administracion");

  const reloadPermissions = async () => {
    const active =
      msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
    if (active) {
      await loadUserProfile(active as AccountInfo);
    }
  };

  return (
    <SharePointAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        getAccessToken,
        hasPermission,
        canRead,
        canWrite,
        canAdmin,
        isSystemAdmin,
        reloadPermissions,
      }}
    >
      {children}
    </SharePointAuthContext.Provider>
  );
}

export function useSharePointAuth(): SharePointAuthContextType {
  const context = useContext(SharePointAuthContext);
  if (!context) {
    throw new Error(
      "useSharePointAuth must be used within a SharePointAuthProvider"
    );
  }
  return context;
}
