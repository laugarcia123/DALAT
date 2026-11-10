import { apiFetch } from "@/lib/api";

export interface PreguntaExamen {
  id: number;
  pregunta: string;
  opciones: string[];
  indice_correcto: number;
  explicacion: string;
}

export interface FlashcardItem {
  id: number;
  anverso: string;
  reverso: string;
  categoria?: string;
  dificultad?: string;
}

export interface ResumenGuiaItem {
  titulo: string;
  resumen_markdown: string;
  puntos_clave: string[];
  formulas_o_conceptos: string[];
}

export interface GenerarRecursoRequest {
  tipo_recurso: "Examen" | "Flashcards" | "Resumen" | "Guia";
  materia: string;
  tema: string;
  dificultad?: string;
  cantidad?: number;
  archivo_nombre?: string;
  texto_adicional?: string;
}

export interface GenerarRecursoResponse {
  id_recurso: string | number;
  tipo_recurso: string;
  materia: string;
  tema: string;
  dificultad: string;
  fuente: "cache" | "gemini" | "groq" | "openrouter" | "heuristico_local";
  tiempo_generacion_ms: number;
  contenido: PreguntaExamen[] | FlashcardItem[] | ResumenGuiaItem | any;
}

export const aiService = {
  /**
   * Solicita la generación de un recurso académico con IA resiliente
   */
  async generarRecurso(data: GenerarRecursoRequest): Promise<GenerarRecursoResponse> {
    return apiFetch<GenerarRecursoResponse>("/ia/generar-recurso", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false, // Permite uso con o sin sesión
    });
  },

  /**
   * Obtiene el historial de recursos del estudiante
   */
  async getHistorial(): Promise<GenerarRecursoResponse[]> {
    return apiFetch<GenerarRecursoResponse[]>("/ia/historial", {
      method: "GET",
      requiresAuth: true,
    });
  },
};
