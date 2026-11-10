from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
from core.deps import get_optional_user, get_current_user
from schemas.ai_resource import GenerarRecursoRequest, GenerarRecursoResponse
from services.ai_service import AIService
from models.ai_resource import RecursoIA

router = APIRouter(prefix="/ia", tags=["Recursos de Estudio con IA"])


@router.post("/generar-recurso", response_model=GenerarRecursoResponse)
def generar_recurso_estudio(
    req: GenerarRecursoRequest,
    current_user: Optional[Usuario] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Genera recursos de estudio inteligentes (Examen interactivo, Flashcards,
    Resumen o Guía paso a paso) utilizando la arquitectura resiliente de 4 capas:
    Caché en BD -> APIs Externas -> Motor Heurístico Académico Local Garantizado.
    """
    user_id = current_user.id_usuario if current_user else None

    contenido, fuente, elapsed_ms = AIService.generar_recurso_resiliente(
        db=db,
        req=req,
        user_id=user_id,
    )

    return GenerarRecursoResponse(
        id_recurso=f"rec_{int(elapsed_ms)}_{hash(req.tema) % 10000}",
        tipo_recurso=req.tipo_recurso,
        materia=req.materia,
        tema=req.tema,
        dificultad=req.dificultad or "Intermedio",
        fuente=fuente,
        tiempo_generacion_ms=elapsed_ms,
        contenido=contenido,
    )


@router.get("/historial", response_model=List[GenerarRecursoResponse])
def obtener_historial_recursos(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna los recursos generados previamente por el estudiante autenticado."""
    recursos = (
        db.query(RecursoIA)
        .filter(RecursoIA.id_usuario == current_user.id_usuario)
        .order_by(RecursoIA.fecha_creacion.desc())
        .limit(20)
        .all()
    )

    import json
    results = []
    for r in recursos:
        try:
            contenido = json.loads(r.contenido_json)
        except Exception:
            contenido = r.contenido_json

        results.append(
            GenerarRecursoResponse(
                id_recurso=r.id_recurso,
                tipo_recurso=r.tipo_recurso,
                materia=r.materia,
                tema=r.tema,
                dificultad=r.dificultad,
                fuente=r.fuente,
                tiempo_generacion_ms=5,
                contenido=contenido,
            )
        )
    return results
