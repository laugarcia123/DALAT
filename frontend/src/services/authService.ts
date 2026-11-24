import { apiFetch, setStoredToken, getStoredToken } from "@/lib/api";

export interface UserBackend {
  id_usuario: number;
  nombre: string;
  email: string;
  carrera?: string | null;
  universidad?: string | null;
  semestre?: string | null;
  biografia?: string | null;
  avatar_color?: string | null;
  tokens_disponibles?: number;
  tipo_plan: "basico" | "pro" | "institucional" | "micro";
  es_institucional: boolean;
  is_active: boolean;
  fecha_fin_suscripcion?: string | null;
  fecha_registro?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserBackend;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  carrera?: string;
  universidad?: string;
  semestre?: string;
  biografia?: string;
  avatar_color?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  institucion?: string;
  tipo_login?: "normal" | "institucion";
}

export interface UpdateUserPayload {
  nombre?: string;
  carrera?: string;
  universidad?: string;
  semestre?: string;
  biografia?: string;
  avatar_color?: string;
  tipo_plan?: string;
  tokens_disponibles?: number;
  password?: string;
}

export const authService = {
  /**
   * Registro de nuevo usuario
   */
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
    if (res.access_token) {
      setStoredToken(res.access_token);
    }
    return res;
  },

  /**
   * Inicio de sesión rápido social (Google, GitHub, Facebook)
   */
  async socialLogin(provider: string, email?: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/users/social-login", {
      method: "POST",
      body: JSON.stringify({ provider, email }),
      requiresAuth: false,
    });
    if (res.access_token) {
      setStoredToken(res.access_token);
    }
    return res;
  },

  /**
   * Inicio de sesión normal o institucional
   */
  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false,
    });
    if (res.access_token) {
      setStoredToken(res.access_token);
    }
    return res;
  },

  /**
   * Obtener perfil del usuario autenticado actual
   */
  async getMe(): Promise<UserBackend> {
    return apiFetch<UserBackend>("/users/me", {
      method: "GET",
      requiresAuth: true,
    });
  },

  /**
   * Actualizar perfil del usuario
   */
  async updateMe(data: UpdateUserPayload): Promise<UserBackend> {
    return apiFetch<UserBackend>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  /**
   * Actualizar y persistir el plan del usuario (PRO, Micro, etc.)
   */
  async upgradePlan(plan: string, tokens?: number): Promise<UserBackend> {
    return apiFetch<UserBackend>("/users/upgrade-plan", {
      method: "POST",
      body: JSON.stringify({ plan, tokens }),
      requiresAuth: true,
    });
  },

  /**
   * Descontar tokens del saldo del usuario y sincronizar con PostgreSQL
   */
  async deductTokens(amount: number): Promise<UserBackend> {
    return apiFetch<UserBackend>("/users/deduct-tokens", {
      method: "POST",
      body: JSON.stringify({ amount }),
      requiresAuth: true,
    });
  },

  /**
   * Cerrar sesión y purgar todos los datos locales del usuario para evitar filtraciones entre cuentas
   */
  logout(): void {
    setStoredToken(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("dalat_user_plan");
        localStorage.removeItem("dalat_user_tokens");
        localStorage.removeItem("dalat_weekly_goal_hours");
        localStorage.removeItem("dalat_ai_materials");
        localStorage.removeItem("dalat_grade_scale");
      } catch {}
    }
  },

  /**
   * Verificar si existe token almacenado
   */
  hasToken(): boolean {
    return !!getStoredToken();
  },
};
