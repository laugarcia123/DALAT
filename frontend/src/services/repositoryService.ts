import { apiFetch } from "@/lib/api";

export interface DocumentoItem {
  id_documento: number;
  id_usuario: number;
  id_equipo?: number | null;
  nombre: string;
  formato: string; // PDF, MSWORD, PPT, LINK, NOTION, ZIP
  tamano?: string;
  url_recurso?: string | null;
  autor_nombre: string;
  descripcion?: string | null;
  fecha_creacion?: string;
}

export interface EquipoItem {
  id_equipo: number;
  id_usuario: number;
  nombre: string;
  materia: string;
  descripcion?: string | null;
  icono_iniciales: string;
  color: string;
  es_personal: boolean;
  codigo_invitacion?: string | null;
  miembros_count: number;
  documentos_count: number;
  fecha_creacion?: string;
  documentos?: DocumentoItem[];
  es_miembro?: boolean;
  es_creador?: boolean;
  rol_usuario?: string;
}

export interface EquipoCreatePayload {
  nombre: string;
  materia?: string;
  descripcion?: string;
  icono_iniciales?: string;
  color?: string;
  es_personal?: boolean;
  miembros_count?: number;
}

export interface DocumentoCreatePayload {
  id_equipo?: number | null;
  nombre: string;
  formato?: string;
  tamano?: string;
  url_recurso?: string | null;
  autor_nombre?: string;
  descripcion?: string | null;
}

export interface StorageQuotaInfo {
  usado_mb: number;
  limite_mb: number;
  limite_texto: string;
  porcentaje_usado: number;
  documentos_count: number;
  es_pro: boolean;
}

export const repositoryService = {
  /**
   * Obtiene la lista de equipos o carpetas personales con sus documentos.
   */
  async getEquipos(esPersonal?: boolean): Promise<EquipoItem[]> {
    const query = esPersonal !== undefined ? `?es_personal=${esPersonal}` : "";
    return apiFetch<EquipoItem[]>(`/repositorio/equipos${query}`);
  },

  /**
   * Obtiene todos los documentos del repositorio del estudiante.
   */
  async getAllDocumentos(): Promise<DocumentoItem[]> {
    return apiFetch<DocumentoItem[]>("/repositorio/documentos");
  },

  /**
   * Consulta el uso y límite de la cuota de almacenamiento (70 MB gratis vs 2 GB PRO/Institucional).
   */
  async getStorageQuota(): Promise<StorageQuotaInfo> {
    return apiFetch<StorageQuotaInfo>("/repositorio/cuota");
  },

  /**
   * Crea un nuevo equipo de estudio o espacio personal.
   */
  async createEquipo(payload: EquipoCreatePayload): Promise<EquipoItem> {
    return apiFetch<EquipoItem>("/repositorio/equipos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Elimina un equipo y sus documentos asociados.
   */
  async deleteEquipo(id_equipo: number): Promise<{ message: string; id_equipo: number }> {
    return apiFetch<{ message: string; id_equipo: number }>(
      `/repositorio/equipos/${id_equipo}`,
      { method: "DELETE" }
    );
  },

  /**
   * Previsualiza los datos de un equipo por código de invitación (público).
   */
  async previewEquipo(codigoInvitacion: string): Promise<EquipoItem> {
    const clean = codigoInvitacion.trim();
    return apiFetch<EquipoItem>(`/repositorio/equipos/preview/${encodeURIComponent(clean)}`, {
      requiresAuth: false,
    });
  },

  /**
   * Une al usuario autenticado a un equipo mediante su código de invitación.
   */
  async unirseEquipo(codigoInvitacion: string): Promise<EquipoItem> {
    const clean = codigoInvitacion.trim();
    return apiFetch<EquipoItem>(`/repositorio/equipos/${encodeURIComponent(clean)}/unirse`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  /**
   * Obtiene los documentos de un equipo específico.
   */
  async getDocumentos(id_equipo: number): Promise<DocumentoItem[]> {
    return apiFetch<DocumentoItem[]>(`/repositorio/equipos/${id_equipo}/documentos`);
  },

  /**
   * Sube un archivo real directamente al almacenamiento Cloudflare R2 vía backend.
   */
  async uploadDocumentoFile(formData: FormData): Promise<DocumentoItem> {
    return apiFetch<DocumentoItem>("/repositorio/upload", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Agrega un nuevo documento, archivo o enlace a un equipo o espacio.
   */
  async createDocumento(payload: DocumentoCreatePayload): Promise<DocumentoItem> {
    return apiFetch<DocumentoItem>("/repositorio/documentos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Actualiza el título o descripción de un documento existente.
   */
  async updateDocumento(
    id_documento: number,
    payload: { nombre?: string; descripcion?: string }
  ): Promise<DocumentoItem> {
    return apiFetch<DocumentoItem>(`/repositorio/documentos/${id_documento}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Elimina un documento del repositorio.
   */
  async deleteDocumento(
    id_documento: number
  ): Promise<{ message: string; id_documento: number }> {
    return apiFetch<{ message: string; id_documento: number }>(
      `/repositorio/documentos/${id_documento}`,
      { method: "DELETE" }
    );
  },
};
