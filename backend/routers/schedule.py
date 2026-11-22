from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
from core.deps import get_current_user
from schemas.schedule import HorarioCreate, HorarioUpdate, HorarioResponse
from crud.schedule import (
    get_user_schedule,
    get_schedule_item_by_id,
    create_schedule_item,
    update_schedule_item,
    delete_schedule_item,
    seed_default_schedule_for_user,
)

router = APIRouter(prefix="/horarios", tags=["Horario & Calendario"])


@router.get("/", response_model=List[HorarioResponse])
def listar_horarios_usuario(
    dia_semana: Optional[int] = Query(None, ge=1, le=7, description="Filtrar por día (1=Lunes a 7=Domingo)"),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista las clases y bloques del horario del estudiante.
    Si es un usuario nuevo con 0 clases registradas, siembra automáticamente
    un horario universitario modelo.
    """
    items = get_user_schedule(db, user_id=current_user.id_usuario, dia_semana=dia_semana)
    if len(items) == 0 and dia_semana is None:
        items = seed_default_schedule_for_user(db, user_id=current_user.id_usuario)
    return items


@router.post("/", response_model=HorarioResponse, status_code=status.HTTP_201_CREATED)
def agregar_bloque_horario(
    item_in: HorarioCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra una nueva clase o bloque en el horario."""
    return create_schedule_item(db, item_in=item_in, user_id=current_user.id_usuario)


@router.put("/{id_horario}", response_model=HorarioResponse)
def actualizar_bloque_horario(
    id_horario: int,
    item_in: HorarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza los datos de un bloque de clase del horario."""
    db_item = get_schedule_item_by_id(db, schedule_id=id_horario, user_id=current_user.id_usuario)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bloque de horario no encontrado o no pertenece al usuario autenticado.",
        )
    return update_schedule_item(db, db_item=db_item, item_in=item_in)


@router.delete("/{id_horario}")
def eliminar_bloque_horario(
    id_horario: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina una clase o bloque del horario."""
    db_item = get_schedule_item_by_id(db, schedule_id=id_horario, user_id=current_user.id_usuario)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bloque de horario no encontrado.",
        )
    delete_schedule_item(db, db_item=db_item)
    return {"message": "Bloque de horario eliminado exitosamente", "id_horario": id_horario}
