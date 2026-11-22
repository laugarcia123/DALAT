from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
from core.deps import get_current_user
from schemas.study_session import SesionCreate, SesionResponse, SesionStats
from crud.study_session import (
    create_sesion,
    get_user_sesiones,
    calculate_streak_and_hours,
)

router = APIRouter(prefix="/sesiones", tags=["Sesiones de Estudio & Modo Zen"])


@router.get("/stats", response_model=SesionStats)
def obtener_estadisticas_estudio(
    meta_horas: float = Query(40.0, ge=1.0, le=100.0, description="Meta semanal de horas de estudio"),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Calcula en tiempo real la racha activa de días consecutivos,
    las horas estudiadas esta semana, semana anterior y avance hacia la meta.
    """
    return calculate_streak_and_hours(db, user_id=current_user.id_usuario, meta_semanal_horas=meta_horas)


@router.get("/", response_model=List[SesionResponse])
def listar_sesiones_recientes(
    limit: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las sesiones de estudio recientes completadas por el estudiante."""
    return get_user_sesiones(db, user_id=current_user.id_usuario, limit=limit)


@router.post("/", response_model=SesionResponse, status_code=status.HTTP_201_CREATED)
def registrar_sesion_estudio(
    sesion_in: SesionCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Registra una sesión de estudio (Pomodoro, Modo Zen o libre).
    Actualiza automáticamente la racha activa y las horas de estudio del estudiante.
    """
    return create_sesion(db, sesion_in=sesion_in, user_id=current_user.id_usuario)
