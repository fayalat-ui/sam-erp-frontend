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

  // auth
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;

  // permisos
  hasPermission: (module: string, level: string) => boolean;
  canRead: (module: string) => boolean;
  canWrite: (module: string) => boolean;
  canAdmin: (module: string) => boolean;

  // admin del sistema
  isSystemAdmin: boolean;

  // almacenamiento temporal (localStorage)
  getStoredPermissions: () => Record<string, Permisos>;
  saveStoredPermissions: (all: Record<string, Permisos>) => void;
  reloadPermissions: () => Promise<void>;
}

const SharePointAuthContext =
  createContext<SharePointAuthContextType | undefined>(undefined);

const STORAGE_KEY = "samerp_user_permissions_v1";

/**
 * Env opcional: lista de UPNs (emails) que serán Admin del sistema
 * Formato: "user1@dominio.cl,user2@dominio.cl"
 */
const SYSTEM_ADMIN_UPNS = (
  (import.meta.env.VITE_SYSTEM_ADMIN_UPNS as string | undefined) || ""
)
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function readPermissionsStore(): Record<string, Permisos> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Permisos>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePermissionsStore(all: Record<string, Permisos>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function normalizePermisos(p: any): Permisos {
  const out: Permisos = {};
  if (!p || typeof p !== "object") return out;
  for (const k of Object.keys(p)) {
    const v = p[k];
    out[k] = Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  }
  return out;
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

  const computeSystemAdmin = (profile: any) => {
    const jobTitle = (profile?.jobTitle as string | undefined) || "";
    const upn = ((profile?.userPrincipalName as string | undefined) || "")
      .toLowerCase()
      .trim();

    // Heurística conservadora (la que ya tenías)
    const byTitle =
      jobTitle.toLowerCase().includes("admin") ||
      jobTitle.toLowerCase().includes("jefe");

    // Lista explícita (más confiable)
    const byList = upn && SYSTEM_ADMIN_UPNS.includes(upn);

    return Boolean(byTitle || byList);
  };

  const defaultPermisosFor = (systemAdmin: boolean): Permisos => {
    // Base: todos lectura; usuarios depende si es admin
    return {
      rrhh: ["lectura"],
      administradores: ["lectura"],
      osp: ["lectura"],
      usuarios: systemAdmin ? ["lectura", "escritura", "administracion"] : ["lectura"],
    };
  };

  const mergePermisos = (base: Permisos, override?: Permisos): Permisos => {
    const out: Permisos = { ...base };
    if (!override) return out;
    for (const k of Object.keys(override)) {
      out[k] = Array.isArray(override[k]) ? override[k] : [];
    }
    return out;
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

      const systemAdmin = computeSystemAdmin(profile);
      setIsSystemAdmin(systemAdmin);

      const basePermisos = defaultPermisosFor(systemAdmin);

      // Override desde localStorage (si existe)
      const upn = (profile.userPrincipalName as string).toLowerCase().trim();
      const store = readPermissionsStore();
      const overridePerms = store[upn] ? normalizePermisos(store[upn]) : undefined;

      const permisosFinal = mergePermisos(basePermisos, overridePerms);

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

  const getAccessToken = async () => {
    return coreGetAccessToken();
  };

  const hasPermission = (module: string, level: string) => {
    if (!user) return false;
    const permisosModulo = user.permisos[module] || [];
    return permisosModulo.includes(level);
  };

  const canRead = (module: string) => hasPermission(module, "lectura");
  const canWrite = (module: string) => hasPermission(module, "escritura");
  const canAdmin = (module: string) => hasPermission(module, "administracion");

  // helpers para módulo Usuarios (admin del sistema)
  const getStoredPermissions = () => readPermissionsStore();
  const saveStoredPermissions = (all: Record<string, Permisos>) =>
    writePermissionsStore(all);

  const reloadPermissions = async () => {
    const active = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
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
        getStoredPermissions,
        saveStoredPermissions,
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
