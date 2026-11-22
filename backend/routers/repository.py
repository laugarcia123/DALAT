from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
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
    create_documento,
    delete_documento,
    seed_default_repository_for_user,
)

router = APIRouter(prefix="/repositorio", tags=["Repositorio Académico"])


@router.get("/equipos", response_model=List[EquipoResponse])
def listar_equipos_estudio(
    es_personal: Optional[bool] = Query(None, description="Filtrar por equipos (false) o espacios personales (true)"),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lista los equipos de estudio y carpetas personales del usuario.
    Si el usuario no tiene ninguno, siembra automáticamente los equipos modelo de Dalat.
    """
    equipos = get_user_equipos(db, user_id=current_user.id_usuario, es_personal=es_personal)
    if len(equipos) == 0 and es_personal is None:
        equipos = seed_default_repository_for_user(db, user_id=current_user.id_usuario)

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
    """Agrega un archivo, apunte o enlace al repositorio del estudiante."""
    if doc_in.id_equipo:
        db_equipo = get_equipo_by_id(db, equipo_id=doc_in.id_equipo, user_id=current_user.id_usuario)
        if not db_equipo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipo destino no encontrado.",
            )
    return create_documento(db, doc_in=doc_in, user_id=current_user.id_usuario)


@router.delete("/documentos/{id_documento}")
def eliminar_documento_repositorio(
    id_documento: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina un documento del repositorio."""
    eliminado = delete_documento(db, doc_id=id_documento, user_id=current_user.id_usuario)
    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado o no pertenece al usuario.",
        )
    return {"message": "Documento eliminado exitosamente", "id_documento": id_documento}
