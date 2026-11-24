from typing import List, Optional
from sqlalchemy.orm import Session
from models.task import Tarea
from schemas.task import TareaCreate, TareaUpdate


DEFAULT_TASKS_DATA = [
    {"titulo": "Ensayo de Cálculo — integrales dobles", "materia": "Cálculo III", "columna": "urgente", "completada": False},
    {"titulo": "Entregar práctica de Química", "materia": "Química", "columna": "urgente", "completada": False},
    {"titulo": "Presentación de Arquitectura", "materia": "Sistemas", "columna": "urgente", "completada": False},
    {"titulo": "Leer capítulos 7-9 de Economía", "materia": "Economía", "columna": "en_progreso", "completada": False},
    {"titulo": "Completar ejercicios del parcial", "materia": "Cálculo III", "columna": "en_progreso", "completada": False},
    {"titulo": "Revisar apuntes de Historia", "materia": "Historia", "columna": "en_progreso", "completada": False},
    {"titulo": "Cuestionario de Historia Universal", "materia": "Historia", "columna": "para_despues", "completada": False},
    {"titulo": "Investigar proyecto final", "materia": "Arquitectura", "columna": "para_despues", "completada": False},
    {"titulo": "Leer artículo extra de Economía", "materia": "Economía", "columna": "para_despues", "completada": False},
]


def get_user_tasks(db: Session, user_id: int) -> List[Tarea]:
    """Lista todas las tareas de un usuario ordenadas por ID ascendente."""
    return (
        db.query(Tarea)
        .filter(Tarea.id_usuario == user_id)
        .order_by(Tarea.id_tarea.asc())
        .all()
    )


def get_task_by_id(db: Session, task_id: int, user_id: int) -> Optional[Tarea]:
    """Obtiene una tarea asegurando que pertenezca al usuario solicitante."""
    return (
        db.query(Tarea)
        .filter(Tarea.id_tarea == task_id, Tarea.id_usuario == user_id)
        .first()
    )


def create_task(db: Session, task_in: TareaCreate, user_id: int) -> Tarea:
    """Crea una nueva tarea para el usuario."""
    db_task = Tarea(
        id_usuario=user_id,
        titulo=task_in.titulo.strip(),
        materia=task_in.materia.strip() if task_in.materia else "General",
        columna=task_in.columna or "urgente",
        completada=task_in.completada or False,
        prioridad=task_in.prioridad or "media",
        fecha_limite=task_in.fecha_limite,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, db_task: Tarea, task_in: TareaUpdate) -> Tarea:
    """Actualiza campos de una tarea existente (completada, columna, título, etc.)."""
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, db_task: Tarea) -> None:
    """Elimina una tarea permanentemente."""
    db.delete(db_task)
    db.commit()


def seed_default_tasks_for_user(db: Session, user_id: int) -> List[Tarea]:
    """Siembra las tareas iniciales académicas en la cuenta de un estudiante nuevo."""
    created = []
    for item in DEFAULT_TASKS_DATA:
        task = Tarea(
            id_usuario=user_id,
            titulo=item["titulo"],
            materia=item["materia"],
            columna=item["columna"],
            completada=item["completada"],
            prioridad="alta" if item["columna"] == "urgente" else "media",
        )
        db.add(task)
        created.append(task)
    db.commit()
    for t in created:
        db.refresh(t)
    return created
