from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from models.subject import Asignatura, Evaluacion
from schemas.subject import (
    AsignaturaCreate,
    AsignaturaUpdate,
    AsignaturaStats,
    CorteSummary,
    EvaluacionCreate,
    EvaluacionUpdate,
    CalculadoraItem,
    CalculadoraResponse,
)


# ====================================================
# Algoritmos de Cálculo Académico y Estadísticas
# ====================================================

def calcular_estadisticas_evaluaciones(
    evaluaciones: List[Evaluacion],
    escala_maxima: float = 5.0,
    nota_aprobatoria: float = 3.0,
) -> AsignaturaStats:
    """
    Calcula el promedio ponderado actual, el porcentaje evaluado y pendiente,
    la nota acumulada sobre el 100% y la nota necesaria para aprobar en el porcentaje restante.
    """
    calificados = [e for e in evaluaciones if e.nota is not None]
    
    peso_evaluado = sum(e.peso_porcentaje for e in calificados)
    suma_ponderada = sum(e.nota * e.peso_porcentaje for e in calificados)
    
    # Aporte real a la nota final sobre la escala (ej: sobre 5.0)
    # cada evaluación aporta: (nota * (peso / 100))
    nota_acumulada = sum(e.nota * (e.peso_porcentaje / 100.0) for e in calificados)
    
    porcentaje_evaluado = round(min(100.0, peso_evaluado), 2)
    porcentaje_restante = round(max(0.0, 100.0 - peso_evaluado), 2)
    nota_acumulada = round(nota_acumulada, 2)
    
    if peso_evaluado > 0:
        promedio_actual = round(suma_ponderada / peso_evaluado, 2)
    else:
        promedio_actual = None

    # Cálculo de lo requerido para aprobar
    if nota_acumulada >= nota_aprobatoria:
        nota_necesaria = 0.0
        es_alcanzable = True
        estado_estimado = "aprobada asegurada"
        mensaje_diagnostico = (
            f"¡Excelente! Ya acumulaste {nota_acumulada:.2f} puntos, superando la nota aprobatoria de {nota_aprobatoria:.1f}."
        )
    elif porcentaje_restante <= 0.0:
        nota_necesaria = None
        es_alcanzable = False
        estado_estimado = "reprobada" if (promedio_actual or 0) < nota_aprobatoria else "aprobada"
        mensaje_diagnostico = (
            f"La asignatura finalizó. Nota definitiva: {promedio_actual or nota_acumulada:.2f} sobre {escala_maxima:.1f}."
        )
    else:
        puntos_faltantes = round(nota_aprobatoria - nota_acumulada, 4)
        fraccion_restante = porcentaje_restante / 100.0
        nota_necesaria = round(puntos_faltantes / fraccion_restante, 2)

        if nota_necesaria <= escala_maxima:
            es_alcanzable = True
            if promedio_actual is not None and promedio_actual >= nota_aprobatoria:
                estado_estimado = "aprobando"
                mensaje_diagnostico = (
                    f"Buen ritmo. Necesitas {nota_necesaria:.2f} sobre {escala_maxima:.1f} en el {porcentaje_restante:.0f}% restante para asegurar tu aprobación."
                )
            else:
                estado_estimado = "en riesgo"
                mensaje_diagnostico = (
                    f"Requiere atención: necesitas promediar {nota_necesaria:.2f} sobre {escala_maxima:.1f} en el {porcentaje_restante:.0f}% restante para alcanzar {nota_aprobatoria:.1f}."
                )
        else:
            es_alcanzable = False
            estado_estimado = "reprobando"
            mensaje_diagnostico = (
                f"Crítico: Matemáticamente requerirías {nota_necesaria:.2f} sobre {escala_maxima:.1f}. Consulta con tu docente opciones de recuperación."
            )

    return AsignaturaStats(
        promedio_actual=promedio_actual,
        porcentaje_evaluado=porcentaje_evaluado,
        porcentaje_restante=porcentaje_restante,
        nota_acumulada=nota_acumulada,
        nota_necesaria_para_aprobar=nota_necesaria,
        es_alcanzable=es_alcanzable,
        estado_estimado=estado_estimado,
        mensaje_diagnostico=mensaje_diagnostico,
    )


def calcular_cortes_asignatura(evaluaciones: List[Evaluacion]) -> List[CorteSummary]:
    """Agrupa las evaluaciones por corte y calcula subtotales y promedios por corte."""
    cortes_dict: Dict[int, List[Evaluacion]] = {}
    for eval_item in evaluaciones:
        c = eval_item.corte or 1
        cortes_dict.setdefault(c, []).append(eval_item)

    resultados: List[CorteSummary] = []
    for corte_num in sorted(cortes_dict.keys()):
        items = cortes_dict[corte_num]
        calificados = [e for e in items if e.nota is not None]
        peso_total = sum(e.peso_porcentaje for e in items)
        peso_evaluado = sum(e.peso_porcentaje for e in calificados)
        
        promedio_corte = None
        if peso_evaluado > 0:
            promedio_corte = round(
                sum(e.nota * e.peso_porcentaje for e in calificados) / peso_evaluado, 2
            )

        resultados.append(
            CorteSummary(
                corte=corte_num,
                promedio=promedio_corte,
                porcentaje_total=round(peso_total, 2),
                porcentaje_evaluado=round(peso_evaluado, 2),
                evaluaciones=items,
            )
        )
    return resultados


def calcular_calculadora_rapida(
    items: List[CalculadoraItem],
    escala_maxima: float = 5.0,
    nota_aprobatoria: float = 3.0,
) -> CalculadoraResponse:
    """Ejecuta el cálculo ponderado en memoria para el widget de Calculadora Rápida."""
    # Convertimos los items a objetos simulados para reutilizar la función de cálculo
    class MockEvaluacion:
        def __init__(self, nota: Optional[float], peso_porcentaje: float):
            self.nota = nota
            self.peso_porcentaje = peso_porcentaje

    mock_evals = [MockEvaluacion(nota=item.nota, peso_porcentaje=item.peso_porcentaje) for item in items]
    stats = calcular_estadisticas_evaluaciones(
        evaluaciones=mock_evals,
        escala_maxima=escala_maxima,
        nota_aprobatoria=nota_aprobatoria,
    )

    return CalculadoraResponse(
        promedio_ponderado=stats.promedio_actual,
        porcentaje_evaluado=stats.porcentaje_evaluado,
        porcentaje_restante=stats.porcentaje_restante,
        nota_acumulada=stats.nota_acumulada,
        nota_necesaria_para_aprobar=stats.nota_necesaria_para_aprobar,
        es_alcanzable=stats.es_alcanzable,
        estado=stats.estado_estimado,
        mensaje_diagnostico=stats.mensaje_diagnostico,
    )


# ====================================================
# CRUD de Asignaturas
# ====================================================

def get_user_subjects(db: Session, user_id: int) -> List[Asignatura]:
    """Obtiene todas las asignaturas de un usuario."""
    return (
        db.query(Asignatura)
        .filter(Asignatura.id_usuario == user_id)
        .order_by(Asignatura.nombre.asc())
        .all()
    )


def get_subject_by_id(db: Session, subject_id: int, user_id: int) -> Optional[Asignatura]:
    """Obtiene una asignatura específica asegurando que pertenezca al usuario solicitante."""
    return (
        db.query(Asignatura)
        .filter(Asignatura.id_asignatura == subject_id, Asignatura.id_usuario == user_id)
        .first()
    )


def create_subject(db: Session, subject_in: AsignaturaCreate, user_id: int) -> Asignatura:
    """Crea una nueva asignatura y opcionalmente sus evaluaciones iniciales."""
    db_subject = Asignatura(
        id_usuario=user_id,
        nombre=subject_in.nombre.strip(),
        codigo=subject_in.codigo.strip() if subject_in.codigo else None,
        profesor=subject_in.profesor.strip() if subject_in.profesor else None,
        creditos=subject_in.creditos or 3,
        color=subject_in.color or "#7c5dfa",
        icono=subject_in.icono or "book",
        periodo=subject_in.periodo.strip() if subject_in.periodo else None,
        escala_maxima=subject_in.escala_maxima or 5.0,
        nota_aprobatoria=subject_in.nota_aprobatoria or 3.0,
        estado=subject_in.estado or "cursando",
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)

    # Si se proporcionaron evaluaciones iniciales, se agregan de una vez
    if subject_in.evaluaciones_iniciales:
        for eval_in in subject_in.evaluaciones_iniciales:
            db_eval = Evaluacion(
                id_asignatura=db_subject.id_asignatura,
                nombre=eval_in.nombre.strip(),
                tipo=eval_in.tipo or "Parcial",
                corte=eval_in.corte or 1,
                nota=eval_in.nota,
                max_nota=eval_in.max_nota or db_subject.escala_maxima,
                peso_porcentaje=eval_in.peso_porcentaje,
                fecha=eval_in.fecha,
                completada=eval_in.completada or (eval_in.nota is not None),
                retroalimentacion=eval_in.retroalimentacion,
            )
            db.add(db_eval)
        db.commit()
        db.refresh(db_subject)

    return db_subject


def update_subject(db: Session, db_subject: Asignatura, subject_in: AsignaturaUpdate) -> Asignatura:
    """Actualiza los campos de una asignatura."""
    update_data = subject_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(db_subject, field, value)

    db.commit()
    db.refresh(db_subject)
    return db_subject


def delete_subject(db: Session, db_subject: Asignatura) -> None:
    """Elimina una asignatura (sus evaluaciones se eliminan en cascada)."""
    db.delete(db_subject)
    db.commit()


# ====================================================
# CRUD de Evaluaciones
# ====================================================

def get_evaluation_by_id(db: Session, eval_id: int) -> Optional[Evaluacion]:
    """Obtiene una evaluación por su ID."""
    return db.query(Evaluacion).filter(Evaluacion.id_evaluacion == eval_id).first()


def create_evaluation(db: Session, subject_id: int, eval_in: EvaluacionCreate) -> Evaluacion:
    """Agrega una nueva evaluación a una asignatura."""
    db_eval = Evaluacion(
        id_asignatura=subject_id,
        nombre=eval_in.nombre.strip(),
        tipo=eval_in.tipo or "Parcial",
        corte=eval_in.corte or 1,
        nota=eval_in.nota,
        max_nota=eval_in.max_nota or 5.0,
        peso_porcentaje=eval_in.peso_porcentaje,
        fecha=eval_in.fecha,
        completada=eval_in.completada or (eval_in.nota is not None),
        retroalimentacion=eval_in.retroalimentacion,
    )
    db.add(db_eval)
    db.commit()
    db.refresh(db_eval)
    return db_eval


def update_evaluation(db: Session, db_eval: Evaluacion, eval_in: EvaluacionUpdate) -> Evaluacion:
    """Actualiza una evaluación existente."""
    update_data = eval_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(db_eval, field, value)

    # Si se actualizó la nota y no es None, marcar como completada
    if "nota" in update_data and update_data["nota"] is not None and "completada" not in update_data:
        db_eval.completada = True

    db.commit()
    db.refresh(db_eval)
    return db_eval


def delete_evaluation(db: Session, db_eval: Evaluacion) -> None:
    """Elimina una evaluación."""
    db.delete(db_eval)
    db.commit()
