import React, { createContext, useCallback, useEffect, useState } from "react";
import { authApi, type AuthResponse, type AuthUser } from "@/api";
import apiClient from "@/lib/apiClient";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogleCode: (code: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    jlptTargetLevel?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => apiClient.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getCurrentUser();
      setUser(response);
      apiClient.setStoredUser(response);
      setIsAuthenticated(apiClient.isAuthenticated());
    } catch {
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
      const response = await authApi.login({
        email,
        password,
      });
      apiClient.setAuthData(response.accessToken, response.user, response.refreshToken);
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
        const response = await authApi.register({
          email,
          password,
          displayName,
          jlptTargetLevel,
        });
        apiClient.setAuthData(response.accessToken, response.user, response.refreshToken);
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

  const loginWithGoogleCode = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await authApi.googleAuth(code);
      apiClient.setAuthData(response.accessToken, response.user, response.refreshToken);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google authentication failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const isAdmin = useCallback(() => {
    return user?.roles?.includes("ADMIN") || false;
  }, [user]);

  const hasRole = useCallback(
    (role: string) => {
      return user?.roles?.includes(role.toUpperCase()) || false;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (user?.roles?.includes("ADMIN")) {
        return true;
      }
      return user?.permissions?.includes(permission) || false;
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogleCode,
    register,
    logout,
    refreshUser,
    isAdmin,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export context for custom hooks
export { AuthContext };
