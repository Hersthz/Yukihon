import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import apiClient from "@/lib/apiClient";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => apiClient.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(
    apiClient.isAuthenticated()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh user on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await apiClient.auth.login({
        email,
        password,
      });
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
    async (email: string, password: string, displayName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response: any = await apiClient.auth.register({
          email,
          password,
          displayName,
        });
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

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: any = await apiClient.auth.getCurrentUser();
      setUser(response);
      apiClient.setAuthData(
        localStorage.getItem("yukihon_token") || "",
        response
      );
    } catch (err) {
      // Silent fail, just logout
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
