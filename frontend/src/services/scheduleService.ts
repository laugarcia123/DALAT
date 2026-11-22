import { apiFetch } from "@/lib/api";

export interface ScheduleBackendItem {
  id_horario: number;
  id_usuario: number;
  id_asignatura?: number | null;
  titulo: string;
  dia_semana: number; // 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
  hora_inicio: string; // "HH:MM"
  hora_fin?: string | null;
  duracion_minutos?: number;
  lugar?: string;
  profesor?: string | null;
  color?: string;
  tipo?: string;
  fecha_creacion?: string;
}

export interface ScheduleCreatePayload {
  titulo: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin?: string | null;
  duracion_minutos?: number;
  lugar?: string;
  profesor?: string | null;
  color?: string;
  tipo?: string;
  id_asignatura?: number | null;
}

export interface ScheduleUpdatePayload {
  titulo?: string;
  dia_semana?: number;
  hora_inicio?: string;
  hora_fin?: string | null;
  duracion_minutos?: number;
  lugar?: string;
  profesor?: string | null;
  color?: string;
  tipo?: string;
  id_asignatura?: number | null;
}

export const scheduleService = {
  /**
   * Obtiene la lista de bloques de horario del estudiante, opcionalmente filtrada por día.
   */
  async getSchedule(diaSemana?: number): Promise<ScheduleBackendItem[]> {
    const query = diaSemana ? `?dia_semana=${diaSemana}` : "";
    return apiFetch<ScheduleBackendItem[]>(`/horarios/${query}`);
  },

  /**
   * Registra una nueva clase o bloque en el horario.
   */
  async createScheduleItem(
    payload: ScheduleCreatePayload
  ): Promise<ScheduleBackendItem> {
    return apiFetch<ScheduleBackendItem>("/horarios/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Actualiza los datos de una clase o bloque del horario.
   */
  async updateScheduleItem(
    id_horario: number,
    payload: ScheduleUpdatePayload
  ): Promise<ScheduleBackendItem> {
    return apiFetch<ScheduleBackendItem>(`/horarios/${id_horario}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Elimina un bloque del horario.
   */
  async deleteScheduleItem(
    id_horario: number
  ): Promise<{ message: string; id_horario: number }> {
    return apiFetch<{ message: string; id_horario: number }>(
      `/horarios/${id_horario}`,
      {
        method: "DELETE",
      }
    );
  },
};
