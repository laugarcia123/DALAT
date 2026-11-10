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
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => void;
  clearError: () => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  name: "Andrea",
  email: "andrea.gomez@universidad.edu",
  career: "Ingeniería de Sistemas",
  university: "Universidad Central",
  semester: "6to Semestre",
  bio: "Estudiante enfocada en cálculo multivariable, algoritmos y diseño de sistemas.",
  avatarColor: "#5828c6",
  isInstitutional: false,
  plan: "basico",
  targetGpa: "4.7 / 5.0",
  studyStreakDays: 14,
  totalStudyHours: 52.4,
};

function mapBackendUserToProfile(backendUser: UserBackend): UserProfile {
  return {
    id: backendUser.id_usuario,
    name: backendUser.nombre,
    email: backendUser.email,
    career: backendUser.carrera || "Carrera no especificada",
    university: backendUser.universidad || "Universidad",
    semester: backendUser.semestre || "Semestre actual",
    bio: backendUser.biografia || "",
    avatarColor: backendUser.avatar_color || "#7c5dfa",
    isInstitutional: backendUser.es_institucional,
    plan: backendUser.tipo_plan,
    targetGpa: "4.5 / 5.0",
    studyStreakDays: 14,
    totalStudyHours: 52.4,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_DEMO_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Al montar, verificamos si hay token y sincronizamos con el backend
  useEffect(() => {
    async function loadUser() {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const backendUser = await authService.getMe();
        const profile = mapBackendUserToProfile(backendUser);
        setUser(profile);
        setIsAuthenticated(true);
      } catch (err: any) {
        console.warn("[Auth] No se pudo restaurar sesión previa:", err?.message);
        // Si el token es inválido o el backend no responde, mantenemos el demo user si ya estaba
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
        });
        const profile = mapBackendUserToProfile(backendUpdated);
        setUser(profile);
        return profile;
      } else {
        // Modo demo local
        setUser((prev) => {
          if (!prev) return DEFAULT_DEMO_USER;
          return { ...prev, ...updatedData };
        });
        return { ...(user || DEFAULT_DEMO_USER), ...updatedData };
      }
    } catch (err: any) {
      const message = err?.message || "Error al actualizar el perfil.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
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
        updateProfile,
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
