import { apiFetch } from "@/lib/api";

export interface EvaluacionItem {
  id_evaluacion?: number;
  nombre: string;
  tipo?: string;
  corte?: number;
  nota?: number | null;
  max_nota?: number;
  peso_porcentaje: number;
  fecha?: string | null;
  completada?: boolean;
  retroalimentacion?: string | null;
}

export interface AsignaturaStats {
  promedio_actual: number | null;
  porcentaje_evaluado: number;
  porcentaje_restante: number;
  nota_acumulada: number;
  nota_necesaria_para_aprobar: number | null;
  es_alcanzable: boolean;
  estado_estimado: string;
  mensaje_diagnostico: string;
}

export interface CorteSummary {
  corte: number;
  promedio: number | null;
  porcentaje_total: number;
  porcentaje_evaluado: number;
  evaluaciones: EvaluacionItem[];
}

export interface Asignatura {
  id_asignatura: number;
  id_usuario: number;
  nombre: string;
  codigo?: string | null;
  profesor?: string | null;
  creditos: number;
  color: string;
  icono?: string | null;
  periodo?: string | null;
  escala_maxima: number;
  nota_aprobatoria: number;
  estado: string;
  fecha_creacion?: string;
  stats?: AsignaturaStats | null;
  evaluaciones?: EvaluacionItem[];
  cortes?: CorteSummary[];
}

export interface CalculadoraItem {
  nombre?: string;
  nota?: number | null;
  peso_porcentaje: number;
}

export interface CalculadoraRequest {
  escala_maxima?: number;
  nota_aprobatoria?: number;
  evaluaciones: CalculadoraItem[];
}

export interface CalculadoraResponse {
  promedio_ponderado: number | null;
  porcentaje_evaluado: number;
  porcentaje_restante: number;
  nota_acumulada: number;
  nota_necesaria_para_aprobar: number | null;
  es_alcanzable: boolean;
  estado: string;
  mensaje_diagnostico: string;
}

export const subjectService = {
  /**
   * Ejecuta el cálculo rápido en el backend para el widget de notas
   */
  async calculateQuickGrades(data: CalculadoraRequest): Promise<CalculadoraResponse> {
    return apiFetch<CalculadoraResponse>("/asignaturas/calculadora", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: false, // La calculadora rápida puede usarse de forma libre
    });
  },

  /**
   * Obtiene la lista de asignaturas del usuario con sus estadísticas calculadas
   */
  async getSubjects(): Promise<Asignatura[]> {
    return apiFetch<Asignatura[]>("/asignaturas/", {
      method: "GET",
      requiresAuth: true,
    });
  },

  /**
   * Obtiene el detalle de una asignatura con sus cortes y evaluaciones
   */
  async getSubject(id: number): Promise<Asignatura> {
    return apiFetch<Asignatura>(`/asignaturas/${id}`, {
      method: "GET",
      requiresAuth: true,
    });
  },

  /**
   * Crea una nueva asignatura
   */
  async createSubject(data: Partial<Asignatura>): Promise<Asignatura> {
    return apiFetch<Asignatura>("/asignaturas/", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  /**
   * Actualiza una asignatura existente
   */
  async updateSubject(id: number, data: Partial<Asignatura>): Promise<Asignatura> {
    return apiFetch<Asignatura>(`/asignaturas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  /**
   * Elimina una asignatura
   */
  async deleteSubject(id: number): Promise<{ message: string; id_asignatura: number }> {
    return apiFetch(`/asignaturas/${id}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },

  /**
   * Agrega una evaluación a una asignatura
   */
  async addEvaluation(subjectId: number, data: EvaluacionItem): Promise<EvaluacionItem> {
    return apiFetch<EvaluacionItem>(`/asignaturas/${subjectId}/evaluaciones`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  /**
   * Actualiza una evaluación
   */
  async updateEvaluation(evalId: number, data: Partial<EvaluacionItem>): Promise<EvaluacionItem> {
    return apiFetch<EvaluacionItem>(`/asignaturas/evaluaciones/${evalId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  /**
   * Elimina una evaluación
   */
  async deleteEvaluation(evalId: number): Promise<{ message: string; id_evaluacion: number }> {
    return apiFetch(`/asignaturas/evaluaciones/${evalId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },
};
