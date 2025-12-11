import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/lib/msalConfig';

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
  canRead: (module: string) => boolean;
  canWrite: (module: string) => boolean;
  canAdmin: (module: string) => boolean;
}

const SharePointAuthContext = createContext<SharePointAuthContextType | undefined>(undefined);

export function SharePointAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SharePointUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [msalInstance] = useState(() => new PublicClientApplication(msalConfig));

  useEffect(() => {
    initializeMsal();
  }, []);

  const initializeMsal = async () => {
    try {
      await msalInstance.initialize();
      
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setIsAuthenticated(true);
        await loadUserProfile(accounts[0]);
      }
    } catch (error) {
      console.error('Error initializing MSAL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (account: AccountInfo) => {
    try {
      const accessToken = await getAccessToken();
      
      // Get user profile from Microsoft Graph
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const profile = await response.json();
        
        // Set default permissions - in a real app, these would come from SharePoint or a database
        const defaultPermisos = {
          rrhh: ['lectura'],
          administradores: ['lectura'],
          osp: ['lectura'],
          usuarios: profile.jobTitle?.toLowerCase().includes('admin') ? ['lectura', 'escritura', 'administracion'] : ['lectura']
        };

        const userData: SharePointUser = {
          id: profile.id,
          displayName: profile.displayName,
          mail: profile.mail,
          userPrincipalName: profile.userPrincipalName,
          jobTitle: profile.jobTitle,
          department: profile.department,
          permisos: defaultPermisos
        };

        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      
      if (response.account) {
        setIsAuthenticated(true);
        await loadUserProfile(response.account);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await msalInstance.logoutPopup();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getAccessToken = async (): Promise<string> => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No authenticated user found');
    }

    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed, trying interactive:', error);
      try {
        const response = await msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError);
        throw new Error('Failed to acquire access token');
      }
    }
  };

  const canRead = (module: string): boolean => {
    if (!user || !user.permisos[module]) return false;
    return user.permisos[module].includes('lectura');
  };

  const canWrite = (module: string): boolean => {
    if (!user || !user.permisos[module]) return false;
    return user.permisos[module].includes('escritura');
  };

  const canAdmin = (module: string): boolean => {
    if (!user || !user.permisos[module]) return false;
    return user.permisos[module].includes('administracion');
  };

  return (
    <SharePointAuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      getAccessToken,
      canRead,
      canWrite,
      canAdmin
    }}>
      {children}
    </SharePointAuthContext.Provider>
  );
}

export function useSharePointAuth() {
  const context = useContext(SharePointAuthContext);
  if (context === undefined) {
    throw new Error('useSharePointAuth must be used within a SharePointAuthProvider');
  }
  return context;
}