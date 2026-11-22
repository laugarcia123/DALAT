from typing import List, Optional
import time
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
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


@router.post("/subir-material")
async def subir_material_estudio(
    file: UploadFile = File(...),
    materia: Optional[str] = Form(None),
    current_user: Optional[Usuario] = Depends(get_optional_user),
):
    """
    Recibe un archivo real desde el ordenador del estudiante (PDF, Word, TXT, etc.)
    y extrae sus metadatos y contenido para generar recursos de estudio con IA.
    """
    filename = file.filename or "Documento_Subido.pdf"
    try:
        content_bytes = await file.read()
    except TypeError:
        content_bytes = file.file.read() if hasattr(file, "file") else b""
    size_bytes = len(content_bytes)

    # Formatear tamaño amigable (KB o MB)
    if size_bytes >= 1024 * 1024:
        size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        size_str = f"{max(1, int(size_bytes / 1024))} KB"

    # Determinar tipo
    ext = filename.split(".")[-1].lower() if "." in filename else "pdf"
    file_type = "pdf" if ext == "pdf" else "docx" if ext in ["doc", "docx"] else "txt"

    # Extracción de contenido de texto preliminar
    extracted_text = ""
    try:
        extracted_text = content_bytes.decode("utf-8", errors="ignore")[:3000]
    except Exception:
        extracted_text = f"Material académico del archivo {filename}"

    # Inferir materia a partir del nombre o contenido
    lower_name = filename.lower()
    inferred_subject = materia.strip() if materia else "General"
    if not materia:
        if any(w in lower_name for w in ["calc", "integral", "derivada", "matematic"]):
            inferred_subject = "Cálculo III"
        elif any(w in lower_name for w in ["econ", "micro", "macro", "demanda", "oferta"]):
            inferred_subject = "Economía"
        elif any(w in lower_name for w in ["quimic", "reaccion", "estequio"]):
            inferred_subject = "Química"
        elif any(w in lower_name for w in ["fisic", "newton", "energia", "mecanic"]):
            inferred_subject = "Física Mecánica"
        elif any(w in lower_name for w in ["sistem", "soft", "arq", "program", "algorit"]):
            inferred_subject = "Arquitectura de Software"

    file_id = f"f_{int(time.time() * 1000)}"

    return {
        "id": file_id,
        "name": filename,
        "subject": inferred_subject,
        "size": size_str,
        "type": file_type,
        "preview_text": extracted_text[:800],
        "message": "Archivo cargado exitosamente desde tu ordenador.",
    }
