import { apiFetch } from "@/lib/api";

export interface StudySessionStats {
  total_horas_historicas: number;
  horas_esta_semana: number;
  horas_semana_pasada: number;
  diferencia_horas_semana: number;
  racha_dias_actual: number;
  record_racha_dias: number;
  meta_semanal_horas: number;
  porcentaje_meta_semanal: number;
  horas_faltantes_meta: number;
  sesiones_hoy_count: number;
  minutos_hoy: number;
}

export interface StudySessionItem {
  id_sesion: number;
  id_usuario: number;
  duracion_segundos: number;
  materia: string;
  completada: boolean;
  tipo: string;
  notas?: string | null;
  fecha_sesion: string;
}

export interface StudySessionCreatePayload {
  duracion_segundos: number;
  materia?: string;
  completada?: boolean;
  tipo?: string;
  notas?: string;
}

export const studySessionService = {
  /**
   * Obtiene las métricas en tiempo real de racha, horas semanales y meta.
   */
  async getStats(metaHoras: number = 40.0): Promise<StudySessionStats> {
    return apiFetch<StudySessionStats>(`/sesiones/stats?meta_horas=${metaHoras}`);
  },

  /**
   * Obtiene la lista de sesiones de estudio recientes.
   */
  async getRecentSessions(limit: number = 20): Promise<StudySessionItem[]> {
    return apiFetch<StudySessionItem[]>(`/sesiones/?limit=${limit}`);
  },

  /**
   * Registra una sesión de estudio completada en el Modo Zen o Pomodoro.
   */
  async logSession(payload: StudySessionCreatePayload): Promise<StudySessionItem> {
    return apiFetch<StudySessionItem>("/sesiones/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
