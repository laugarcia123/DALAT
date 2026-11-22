import { apiFetch } from "@/lib/api";

export interface TaskBackendItem {
  id_tarea: number;
  id_usuario: number;
  titulo: string;
  materia?: string;
  columna: "urgente" | "en_progreso" | "para_despues" | string;
  completada: boolean;
  prioridad?: string;
  fecha_limite?: string | null;
  fecha_creacion?: string;
}

export interface TaskCreatePayload {
  titulo: string;
  materia?: string;
  columna?: string;
  completada?: boolean;
  prioridad?: string;
  fecha_limite?: string | null;
}

export interface TaskUpdatePayload {
  titulo?: string;
  materia?: string;
  columna?: string;
  completada?: boolean;
  prioridad?: string;
  fecha_limite?: string | null;
}

export const taskService = {
  /**
   * Obtiene la lista de tareas del estudiante organizadas para el Kanban.
   */
  async getTasks(): Promise<TaskBackendItem[]> {
    return apiFetch<TaskBackendItem[]>("/tareas/");
  },

  /**
   * Crea una nueva tarea en la columna especificada.
   */
  async createTask(payload: TaskCreatePayload): Promise<TaskBackendItem> {
    return apiFetch<TaskBackendItem>("/tareas/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Actualiza el estado, columna o detalles de una tarea existente.
   */
  async updateTask(
    id_tarea: number,
    payload: TaskUpdatePayload
  ): Promise<TaskBackendItem> {
    return apiFetch<TaskBackendItem>(`/tareas/${id_tarea}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Elimina una tarea por su ID.
   */
  async deleteTask(id_tarea: number): Promise<{ message: string; id_tarea: number }> {
    return apiFetch<{ message: string; id_tarea: number }>(`/tareas/${id_tarea}`, {
      method: "DELETE",
    });
  },
};
