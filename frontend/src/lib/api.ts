/**
 * Cliente HTTP base para la comunicación con la API de Dalat Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("dalat_token");
  if (!token || token === "null" || token === "undefined" || token.trim() === "") {
    return null;
  }
  return token;
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("dalat_token", token);
  } else {
    localStorage.removeItem("dalat_token");
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers: customHeaders, ...restOptions } = options;
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const isFormData = typeof FormData !== "undefined" && restOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(customHeaders as Record<string, string>),
  };

  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (requiresAuth) {
    // Si la ruta requiere autenticación estricta y no hay token disponible
    console.warn(`[apiFetch] Ruta protegida llamada sin token: ${endpoint}`);
  }

  try {
    const response = await fetch(url, {
      headers,
      ...restOptions,
    });

    const contentType = response.headers.get("content-type");
    let responseData: any = null;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401) {
        setStoredToken(null);
      }
      // Manejar mensajes de error de FastAPI (detail o mensaje plano)
      const errorMessage =
        (responseData && typeof responseData === "object" && responseData.detail) ||
        (typeof responseData === "string" && responseData) ||
        `Error HTTP ${response.status}: ${response.statusText}`;

      throw new ApiError(response.status, errorMessage, responseData);
    }

    return responseData as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Errores de red o conexión caída
    throw new ApiError(
      0,
      error.message || "No fue posible conectar con el servidor backend de Dalat.",
      error
    );
  }
}
