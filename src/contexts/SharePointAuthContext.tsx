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

interface SharePointUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  permisos: Record<string, string[]>;
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
}

const SharePointAuthContext = createContext<SharePointAuthContextType | undefined>(
  undefined
);

export function SharePointAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SharePointUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void initializeAuth();
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

      const jobTitle = (profile.jobTitle as string | undefined) || "";
      const isAdmin =
        jobTitle.toLowerCase().includes("admin") ||
        jobTitle.toLowerCase().includes("jefe");

      const defaultPermisos: Record<string, string[]> = {
        rrhh: ["lectura"],
        administradores: ["lectura"],
        osp: ["lectura"],
        usuarios: isAdmin
          ? ["lectura", "escritura", "administracion"]
          : ["lectura"],
      };

      const userData: SharePointUser = {
        id: profile.id,
        displayName: profile.displayName,
        mail: profile.mail,
        userPrincipalName: profile.userPrincipalName,
        jobTitle: profile.jobTitle,
        department: profile.department,
        permisos: defaultPermisos,
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUser(null);
      setIsAuthenticated(false);
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
