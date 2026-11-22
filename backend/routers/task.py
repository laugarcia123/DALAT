from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
from core.deps import get_current_user
from schemas.task import TareaCreate, TareaUpdate, TareaResponse
from crud.task import (
    get_user_tasks,
    get_task_by_id,
    create_task,
    update_task,
    delete_task,
    seed_default_tasks_for_user,
)

router = APIRouter(prefix="/tareas", tags=["Tareas & Kanban"])


@router.get("/", response_model=List[TareaResponse])
def listar_tareas_usuario(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista las tareas del estudiante organizadas para el tablero Kanban.
    Si es un estudiante nuevo con 0 tareas, le inicializa tareas modelo.
    """
    tareas = get_user_tasks(db, user_id=current_user.id_usuario)
    if len(tareas) == 0:
        tareas = seed_default_tasks_for_user(db, user_id=current_user.id_usuario)
    return tareas


@router.post("/", response_model=TareaResponse, status_code=status.HTTP_201_CREATED)
def crear_nueva_tarea(
    task_in: TareaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una nueva tarea en la columna especificada."""
    return create_task(db, task_in=task_in, user_id=current_user.id_usuario)


@router.put("/{id_tarea}", response_model=TareaResponse)
def actualizar_tarea(
    id_tarea: int,
    task_in: TareaUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza estado, columna o datos de una tarea."""
    db_task = get_task_by_id(db, task_id=id_tarea, user_id=current_user.id_usuario)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada o no pertenece al usuario autenticado.",
        )
    return update_task(db, db_task=db_task, task_in=task_in)


@router.delete("/{id_tarea}")
def eliminar_tarea(
    id_tarea: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina una tarea del tablero."""
    db_task = get_task_by_id(db, task_id=id_tarea, user_id=current_user.id_usuario)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada.",
        )
    delete_task(db, db_task=db_task)
    return {"message": "Tarea eliminada exitosamente", "id_tarea": id_tarea}
