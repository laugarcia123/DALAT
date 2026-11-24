from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
from models.repository import EquipoEstudio, DocumentoRepositorio
from core.deps import get_current_user
from schemas.repository import (
    EquipoCreate,
    EquipoResponse,
    DocumentoCreate,
    DocumentoResponse,
)
from crud.repository import (
    get_user_equipos,
    get_equipo_by_id,
    create_equipo,
    delete_equipo,
    get_equipo_documentos,
    get_all_user_documentos,
    calculate_storage_used_mb,
    create_documento,
    delete_documento,
    seed_default_repository_for_user,
)
from services.storage_service import StorageService

router = APIRouter(prefix="/repositorio", tags=["Repositorio Académico"])


@router.get("/equipos", response_model=List[EquipoResponse])
def listar_equipos_estudio(
    es_personal: Optional[bool] = Query(None, description="Filtrar por equipos (false) o espacios personales (true)"),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista los equipos de estudio y carpetas personales del usuario.
    """
    equipos = get_user_equipos(db, user_id=current_user.id_usuario, es_personal=es_personal)

    # Añadir conteo y documentos a la respuesta
    resultado = []
    for eq in equipos:
        docs = get_equipo_documentos(db, equipo_id=eq.id_equipo, user_id=current_user.id_usuario)
        resp = EquipoResponse.model_validate(eq)
        resp.documentos_count = len(docs)
        resp.documentos = [DocumentoResponse.model_validate(d) for d in docs]
        resultado.append(resp)

    return resultado


@router.post("/equipos", response_model=EquipoResponse, status_code=status.HTTP_201_CREATED)
def crear_nuevo_equipo(
    equipo_in: EquipoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea un nuevo equipo de estudio o carpeta personal."""
    db_equipo = create_equipo(db, equipo_in=equipo_in, user_id=current_user.id_usuario)
    resp = EquipoResponse.model_validate(db_equipo)
    resp.documentos_count = 0
    resp.documentos = []
    return resp


@router.delete("/equipos/{id_equipo}")
def eliminar_equipo_estudio(
    id_equipo: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina un equipo de estudio y sus documentos asociados."""
    db_equipo = get_equipo_by_id(db, equipo_id=id_equipo, user_id=current_user.id_usuario)
    if not db_equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo de estudio no encontrado.",
        )
    delete_equipo(db, db_equipo=db_equipo)
    return {"message": "Equipo eliminado exitosamente", "id_equipo": id_equipo}


@router.post("/equipos/{codigo_invitacion}/unirse", response_model=EquipoResponse)
def unirse_a_equipo_estudio(
    codigo_invitacion: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Permite a un estudiante unirse a un repositorio por enlace o código de invitación,
    incrementando la cantidad de miembros y persistiendo en la base de datos.
    """
    clean_code = codigo_invitacion.strip().lower()
    equipo = db.query(EquipoEstudio).filter(
        (EquipoEstudio.codigo_invitacion.ilike(clean_code)) |
        (EquipoEstudio.codigo_invitacion.ilike(f"dalat-{clean_code}"))
    ).first()

    if not equipo and clean_code.isdigit():
        equipo = db.query(EquipoEstudio).filter(EquipoEstudio.id_equipo == int(clean_code)).first()

    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró un repositorio con ese código de invitación.",
        )

    # Incrementar el número de miembros del equipo
    equipo.miembros_count = (equipo.miembros_count or 1) + 1
    db.commit()
    db.refresh(equipo)

    docs = get_equipo_documentos(db, equipo_id=equipo.id_equipo, user_id=equipo.id_usuario)
    resp = EquipoResponse.model_validate(equipo)
    resp.documentos_count = len(docs)
    resp.documentos = [DocumentoResponse.model_validate(d) for d in docs]
    return resp



@router.get("/documentos", response_model=List[DocumentoResponse])
def listar_todos_los_documentos(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtiene todos los documentos del estudiante en su repositorio académico."""
    return get_all_user_documentos(db, user_id=current_user.id_usuario)


@router.get("/cuota")
def obtener_cuota_almacenamiento(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calcula la cuota de almacenamiento utilizada (70 MB gratis / 2 GB PRO o Institucional)."""
    usado_mb = calculate_storage_used_mb(db, user_id=current_user.id_usuario)
    es_pro = current_user.es_institucional or (current_user.tipo_plan in ["pro", "institucional"])
    limite_mb = 2048.0 if es_pro else 70.0
    porcentaje = min(100.0, round((usado_mb / limite_mb) * 100, 1)) if limite_mb > 0 else 0.0
    docs = get_all_user_documentos(db, user_id=current_user.id_usuario)

    return {
        "usado_mb": usado_mb,
        "limite_mb": limite_mb,
        "limite_texto": "2 GB" if es_pro else "70 MB",
        "porcentaje_usado": porcentaje,
        "documentos_count": len(docs),
        "es_pro": es_pro,
    }


@router.get("/equipos/{id_equipo}/documentos", response_model=List[DocumentoResponse])
def listar_documentos_equipo(
    id_equipo: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Obtiene todos los archivos y apuntes de un equipo."""
    return get_equipo_documentos(db, equipo_id=id_equipo, user_id=current_user.id_usuario)


@router.post("/documentos", response_model=DocumentoResponse, status_code=status.HTTP_201_CREATED)
def agregar_documento(
    doc_in: DocumentoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Agrega un archivo, apunte o enlace al repositorio verificando cuota de almacenamiento."""
    # Validación de cuota
    es_pro = current_user.es_institucional or (current_user.tipo_plan in ["pro", "institucional"])
    limite_mb = 2048.0 if es_pro else 70.0
    usado_mb = calculate_storage_used_mb(db, user_id=current_user.id_usuario)

    doc_size_mb = 1.0
    if doc_in.tamano:
        t = doc_in.tamano.upper().strip()
        try:
            if "MB" in t:
                doc_size_mb = float(t.replace("MB", "").strip())
            elif "KB" in t:
                doc_size_mb = float(t.replace("KB", "").strip()) / 1024.0
            elif "GB" in t:
                doc_size_mb = float(t.replace("GB", "").strip()) * 1024.0
        except ValueError:
            doc_size_mb = 1.0

    if (usado_mb + doc_size_mb) > limite_mb:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Has alcanzado el límite de almacenamiento de {int(limite_mb)} MB ({'2 GB' if es_pro else '70 MB'}). {'Libera espacio en tu repositorio.' if es_pro else 'Mejora a Plan PRO para obtener 2 GB de almacenamiento o libera espacio en tu repositorio.'}",
        )

    if doc_in.id_equipo:
        db_equipo = get_equipo_by_id(db, equipo_id=doc_in.id_equipo, user_id=current_user.id_usuario)
        if not db_equipo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipo destino no encontrado.",
            )
    return create_documento(db, doc_in=doc_in, user_id=current_user.id_usuario)


@router.post("/upload", response_model=DocumentoResponse, status_code=status.HTTP_201_CREATED)
async def subir_documento_r2(
    file: UploadFile = File(...),
    id_equipo: Optional[int] = Form(None),
    formato: Optional[str] = Form(None),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sube un archivo real directamente al almacenamiento Cloudflare R2,
    verifica cuotas y crea el registro de documento en la base de datos.
    """
    contents = await file.read()
    file_size_bytes = len(contents)
    file_size_mb = file_size_bytes / (1024 * 1024)

    # Validar cuota de usuario
    es_pro = current_user.es_institucional or (current_user.tipo_plan in ["pro", "institucional"])
    limite_mb = 2048.0 if es_pro else 70.0
    usado_mb = calculate_storage_used_mb(db, user_id=current_user.id_usuario)

    if (usado_mb + file_size_mb) > limite_mb:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Has alcanzado el límite de almacenamiento de {int(limite_mb)} MB ({'2 GB' if es_pro else '70 MB'}).",
        )

    # Autodetectar formato
    filename_lower = file.filename.lower()
    detected_format = "PDF"
    if filename_lower.endswith((".docx", ".doc")):
        detected_format = "MSWORD"
    elif filename_lower.endswith((".pptx", ".ppt")):
        detected_format = "PPT"
    elif filename_lower.endswith((".zip", ".rar", ".7z", ".tar", ".gz")):
        detected_format = "ZIP"
    elif filename_lower.endswith((".txt", ".md")):
        detected_format = "TXT"

    final_formato = formato or detected_format

    tamano_texto = (
        f"{file_size_mb:.1f} MB"
        if file_size_mb >= 1.0
        else f"{max(1, round(file_size_bytes / 1024))} KB"
    )

    # Subir a Cloudflare R2
    content_type = file.content_type or "application/octet-stream"
    object_key, download_url = StorageService.upload_file_bytes(
        file_bytes=contents,
        filename=file.filename,
        user_id=current_user.id_usuario,
        content_type=content_type
    )

    # Registrar en la base de datos
    doc_in = DocumentoCreate(
        id_equipo=id_equipo,
        nombre=file.filename,
        formato=final_formato,
        tamano=tamano_texto,
        url_recurso=download_url,
        autor_nombre=current_user.nombre_completo or "Tú"
    )

    return create_documento(db, doc_in=doc_in, user_id=current_user.id_usuario)


@router.get("/documentos/{id_documento}/descargar")
def descargar_documento_repositorio(
    id_documento: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Redirige al estudiante al enlace seguro de Cloudflare R2 para descargar el archivo.
    """
    doc = db.query(DocumentoRepositorio).filter(
        DocumentoRepositorio.id_documento == id_documento,
        DocumentoRepositorio.id_usuario == current_user.id_usuario
    ).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado o no autorizado.",
        )

    # Si es URL de R2 o enlace externo, redirigir
    if doc.url_recurso:
        return RedirectResponse(url=doc.url_recurso)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="El archivo no tiene una URL de descarga válida.",
    )


@router.delete("/documentos/{id_documento}")
def eliminar_documento_repositorio(
    id_documento: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina un documento del repositorio y de Cloudflare R2 si aplica."""
    doc = db.query(DocumentoRepositorio).filter(
        DocumentoRepositorio.id_documento == id_documento,
        DocumentoRepositorio.id_usuario == current_user.id_usuario
    ).first()

    if doc and doc.url_recurso and "dalat-documentos" in doc.url_recurso:
        # Intentar extraer object_key si aplica
        try:
            if "documentos/" in doc.url_recurso:
                part = "documentos/" + doc.url_recurso.split("documentos/")[1].split("?")[0]
                StorageService.delete_file(part)
        except Exception as e:
            print(f"[R2 Clean Warning] {e}")

    eliminado = delete_documento(db, doc_id=id_documento, user_id=current_user.id_usuario)
    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado o no pertenece al usuario.",
        )
    return {"message": "Documento eliminado exitosamente", "id_documento": id_documento}
