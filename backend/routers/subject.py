from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
from core.deps import get_current_user
from crud.subject import (
    get_user_subjects,
    get_subject_by_id,
    create_subject,
    update_subject,
    delete_subject,
    get_evaluation_by_id,
    create_evaluation,
    update_evaluation,
    delete_evaluation,
    calcular_estadisticas_evaluaciones,
    calcular_cortes_asignatura,
    calcular_calculadora_rapida,
)
from schemas.subject import (
    AsignaturaCreate,
    AsignaturaUpdate,
    AsignaturaResponse,
    AsignaturaDetailResponse,
    EvaluacionCreate,
    EvaluacionUpdate,
    EvaluacionResponse,
    CalculadoraRequest,
    CalculadoraResponse,
)

router = APIRouter(prefix="/asignaturas", tags=["Asignaturas & Notas"])


# ====================================================
# Calculadora Rápida (Soporte para Widget Instantáneo)
# ====================================================

@router.post("/calculadora", response_model=CalculadoraResponse)
def resolver_calculadora_rapida(data: CalculadoraRequest):
    """
    Calcula instantáneamente el promedio ponderado, el aporte a la nota final
    y la nota que se necesita en el porcentaje restante para aprobar.
    No requiere persistencia en base de datos.
    """
    return calcular_calculadora_rapida(
        items=data.evaluaciones,
        escala_maxima=data.escala_maxima or 5.0,
        nota_aprobatoria=data.nota_aprobatoria or 3.0,
    )


# ====================================================
# Rutas de Asignaturas
# ====================================================

@router.get("/", response_model=List[AsignaturaDetailResponse])
def listar_asignaturas_usuario(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista todas las asignaturas inscritas por el estudiante autenticado,
    con sus evaluaciones, cortes y métricas de promedio en tiempo real.
    """
    subjects = get_user_subjects(db, user_id=current_user.id_usuario)
    responses = []
    for s in subjects:
        stats = calcular_estadisticas_evaluaciones(
            s.evaluaciones,
            escala_maxima=s.escala_maxima,
            nota_aprobatoria=s.nota_aprobatoria,
        )
        cortes = calcular_cortes_asignatura(s.evaluaciones)
        resp = AsignaturaDetailResponse.model_validate(s)
        resp.stats = stats
        resp.cortes = cortes
        responses.append(resp)
    return responses


@router.post("/", response_model=AsignaturaResponse, status_code=status.HTTP_201_CREATED)
def crear_nueva_asignatura(
    subject_in: AsignaturaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea una nueva asignatura para el estudiante."""
    new_subject = create_subject(db, subject_in=subject_in, user_id=current_user.id_usuario)
    stats = calcular_estadisticas_evaluaciones(
        new_subject.evaluaciones,
        escala_maxima=new_subject.escala_maxima,
        nota_aprobatoria=new_subject.nota_aprobatoria,
    )
    resp = AsignaturaResponse.model_validate(new_subject)
    resp.stats = stats
    return resp


@router.get("/{id_asignatura}", response_model=AsignaturaDetailResponse)
def obtener_detalle_asignatura(
    id_asignatura: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtiene el detalle completo de una asignatura, incluyendo todas sus evaluaciones,
    el desglose analítico por cortes y las estadísticas ponderadas.
    """
    subject = get_subject_by_id(db, subject_id=id_asignatura, user_id=current_user.id_usuario)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignatura no encontrada o no pertenece al usuario activo.",
        )

    stats = calcular_estadisticas_evaluaciones(
        subject.evaluaciones,
        escala_maxima=subject.escala_maxima,
        nota_aprobatoria=subject.nota_aprobatoria,
    )
    cortes = calcular_cortes_asignatura(subject.evaluaciones)

    resp = AsignaturaDetailResponse.model_validate(subject)
    resp.stats = stats
    resp.cortes = cortes
    return resp


@router.put("/{id_asignatura}", response_model=AsignaturaResponse)
def actualizar_asignatura(
    id_asignatura: int,
    subject_in: AsignaturaUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza la información de una asignatura existente."""
    subject = get_subject_by_id(db, subject_id=id_asignatura, user_id=current_user.id_usuario)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignatura no encontrada.",
        )

    updated_subject = update_subject(db, db_subject=subject, subject_in=subject_in)
    stats = calcular_estadisticas_evaluaciones(
        updated_subject.evaluaciones,
        escala_maxima=updated_subject.escala_maxima,
        nota_aprobatoria=updated_subject.nota_aprobatoria,
    )
    resp = AsignaturaResponse.model_validate(updated_subject)
    resp.stats = stats
    return resp


@router.delete("/{id_asignatura}")
def eliminar_asignatura(
    id_asignatura: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina una asignatura y todas sus evaluaciones asociadas."""
    subject = get_subject_by_id(db, subject_id=id_asignatura, user_id=current_user.id_usuario)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignatura no encontrada.",
        )

    delete_subject(db, db_subject=subject)
    return {"message": "Asignatura eliminada con éxito", "id_asignatura": id_asignatura}


# ====================================================
# Rutas de Evaluaciones / Calificaciones
# ====================================================

@router.post("/{id_asignatura}/evaluaciones", response_model=EvaluacionResponse, status_code=status.HTTP_201_CREATED)
def agregar_evaluacion(
    id_asignatura: int,
    eval_in: EvaluacionCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Agrega una evaluación o nota a una asignatura específica."""
    subject = get_subject_by_id(db, subject_id=id_asignatura, user_id=current_user.id_usuario)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignatura no encontrada.",
        )

    # Validamos que el total de porcentajes no exceda 100%
    peso_actual = sum(e.peso_porcentaje for e in subject.evaluaciones)
    if peso_actual + eval_in.peso_porcentaje > 100.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La suma de porcentajes excedería el 100% (actual: {peso_actual:.1f}%, nueva: {eval_in.peso_porcentaje:.1f}%).",
        )

    # Si la evaluación no especifica max_nota, hereda la escala de la asignatura
    if not eval_in.max_nota:
        eval_in.max_nota = subject.escala_maxima

    new_eval = create_evaluation(db, subject_id=id_asignatura, eval_in=eval_in)
    return new_eval


@router.put("/evaluaciones/{id_evaluacion}", response_model=EvaluacionResponse)
def actualizar_evaluacion(
    id_evaluacion: int,
    eval_in: EvaluacionUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza una evaluación (asignar nota, cambiar peso, fecha o comentarios)."""
    db_eval = get_evaluation_by_id(db, eval_id=id_evaluacion)
    if not db_eval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluación no encontrada.",
        )

    # Verificar que pertenezca a una asignatura del usuario
    subject = get_subject_by_id(db, subject_id=db_eval.id_asignatura, user_id=current_user.id_usuario)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar esta evaluación.",
        )

    # Si se actualiza el peso, validar que la suma total no supere 100%
    if eval_in.peso_porcentaje is not None and eval_in.peso_porcentaje != db_eval.peso_porcentaje:
        otros_pesos = sum(e.peso_porcentaje for e in subject.evaluaciones if e.id_evaluacion != id_evaluacion)
        if otros_pesos + eval_in.peso_porcentaje > 100.01:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La suma de porcentajes excedería el 100% (otros: {otros_pesos:.1f}%, nuevo: {eval_in.peso_porcentaje:.1f}%).",
            )

    updated_eval = update_evaluation(db, db_eval=db_eval, eval_in=eval_in)
    return updated_eval


@router.delete("/evaluaciones/{id_evaluacion}")
def eliminar_evaluacion(
    id_evaluacion: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina una evaluación."""
    db_eval = get_evaluation_by_id(db, eval_id=id_evaluacion)
    if not db_eval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluación no encontrada.",
        )

    # Verificar propiedad
    subject = get_subject_by_id(db, subject_id=db_eval.id_asignatura, user_id=current_user.id_usuario)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar esta evaluación.",
        )

    delete_evaluation(db, db_eval=db_eval)
    return {"message": "Evaluación eliminada con éxito", "id_evaluacion": id_evaluacion}
