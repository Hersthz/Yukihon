import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import apiClient from "@/api";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, jlptTargetLevel?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => apiClient.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(
    apiClient.isAuthenticated()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.auth.getCurrentUser() as AuthUser;
      setUser(response);
      apiClient.setAuthData(
        localStorage.getItem("yukihon_token") || "",
        response
      );
    } catch (err) {
      // Silent fail, just logout
      apiClient.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.auth.login({
        email,
        password,
      }) as AuthResponse;
      apiClient.setAuthData(response.accessToken, response.user);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string, jlptTargetLevel?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.auth.register({
          email,
          password,
          displayName,
          jlptTargetLevel,
        }) as AuthResponse;
        apiClient.setAuthData(response.accessToken, response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    apiClient.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const isAdmin = useCallback(() => {
    return user?.roles?.includes("ADMIN") || false;
  }, [user]);

  const hasRole = useCallback((role: string) => {
    return user?.roles?.includes(role.toUpperCase()) || false;
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAdmin,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export context for custom hooks
export { AuthContext };
