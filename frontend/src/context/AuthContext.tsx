"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, UserBackend, RegisterPayload, LoginPayload } from "@/services/authService";
import { getStoredToken } from "@/lib/api";

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  career: string;
  university: string;
  semester: string;
  bio: string;
  avatarColor: string;
  isInstitutional?: boolean;
  plan?: string;
  tokensBalance?: number;
  targetGpa?: string;
  studyStreakDays?: number;
  totalStudyHours?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  socialLogin: (provider: string, email?: string) => Promise<UserProfile>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<UserProfile>;
  upgradePlan: (plan: string, tokens?: number) => Promise<UserProfile>;
  deductTokens: (amount: number) => Promise<number>;
  logout: () => void;
  clearError: () => void;
}

function mapBackendUserToProfile(backendUser: UserBackend): UserProfile {
  return {
    id: backendUser.id_usuario,
    name: backendUser.nombre,
    email: backendUser.email,
    career: backendUser.carrera || "",
    university: backendUser.universidad || (backendUser.es_institucional ? "Institución Asociada" : ""),
    semester: backendUser.semestre || "",
    bio: backendUser.biografia || "",
    avatarColor: backendUser.avatar_color || "#7c5dfa",
    isInstitutional: backendUser.es_institucional,
    plan: backendUser.tipo_plan,
    tokensBalance:
      backendUser.tokens_disponibles ??
      (backendUser.es_institucional ? 500 : backendUser.tipo_plan === "pro" ? 150 : 10),
    targetGpa: "4.5 / 5.0",
    studyStreakDays: 0,
    totalStudyHours: 0,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Al montar, verificamos si hay token y sincronizamos con el backend
  useEffect(() => {
    async function loadUser() {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      try {
        const backendUser = await authService.getMe();
        const profile = mapBackendUserToProfile(backendUser);
        setUser(profile);
        setIsAuthenticated(true);
      } catch (err: any) {
        console.warn("[Auth] No se pudo restaurar sesión previa:", err?.message);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (payload: LoginPayload): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(payload);
      const profile = mapBackendUserToProfile(response.user);
      setUser(profile);
      setIsAuthenticated(true);
      return profile;
    } catch (err: any) {
      const message = err?.message || "Error al iniciar sesión.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: string, email?: string): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.socialLogin(provider, email);
      const profile = mapBackendUserToProfile(response.user);
      setUser(profile);
      setIsAuthenticated(true);
      return profile;
    } catch (err: any) {
      const message = err?.message || "Error al iniciar sesión rápida.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      const profile = mapBackendUserToProfile(response.user);
      setUser(profile);
      setIsAuthenticated(true);
      return profile;
    } catch (err: any) {
      const message = err?.message || "Error al registrar la cuenta.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      // Si hay sesión en backend con token
      if (getStoredToken()) {
        const backendUpdated = await authService.updateMe({
          nombre: updatedData.name,
          carrera: updatedData.career,
          universidad: updatedData.university,
          semestre: updatedData.semester,
          biografia: updatedData.bio,
          avatar_color: updatedData.avatarColor,
          tipo_plan: updatedData.plan,
          tokens_disponibles: updatedData.tokensBalance,
        });
        const profile = mapBackendUserToProfile(backendUpdated);
        setUser(profile);
        return profile;
      } else {
        // Actualización en memoria si no hay token
        setUser((prev) => {
          if (!prev) return null;
          return { ...prev, ...updatedData };
        });
        return { ...(user || ({} as UserProfile)), ...updatedData };
      }
    } catch (err: any) {
      const message = err?.message || "Error al actualizar el perfil.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradePlan = async (plan: string, tokens?: number): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      if (getStoredToken()) {
        const backendUpdated = await authService.upgradePlan(plan, tokens);
        const profile = mapBackendUserToProfile(backendUpdated);
        setUser(profile);
        return profile;
      } else {
        setUser((prev) => {
          if (!prev) return null;
          return { ...prev, plan, tokensBalance: tokens ?? (plan === "pro" ? 150 : 10) };
        });
        return { ...(user || ({} as UserProfile)), plan, tokensBalance: tokens ?? 150 };
      }
    } catch (err: any) {
      const message = err?.message || "Error al actualizar el plan.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deductTokens = async (amount: number): Promise<number> => {
    try {
      if (getStoredToken()) {
        const updated = await authService.deductTokens(amount);
        const newBalance = updated.tokens_disponibles ?? 0;
        setUser((prev) => (prev ? { ...prev, tokensBalance: newBalance } : null));
        return newBalance;
      }
    } catch (err: any) {
      console.warn("[Auth] Error descontando tokens en backend:", err);
    }
    return 0;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        socialLogin,
        updateProfile,
        upgradePlan,
        deductTokens,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
