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

export const repositoryService = {
  /**
   * Obtiene la lista de equipos o carpetas personales con sus documentos.
   */
  async getEquipos(esPersonal?: boolean): Promise<EquipoItem[]> {
    const query = esPersonal !== undefined ? `?es_personal=${esPersonal}` : "";
    return apiFetch<EquipoItem[]>(`/repositorio/equipos${query}`);
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
   * Obtiene los documentos de un equipo específico.
   */
  async getDocumentos(id_equipo: number): Promise<DocumentoItem[]> {
    return apiFetch<DocumentoItem[]>(`/repositorio/equipos/${id_equipo}/documentos`);
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
