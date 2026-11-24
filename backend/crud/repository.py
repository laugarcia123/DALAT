import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from models.repository import EquipoEstudio, DocumentoRepositorio
from schemas.repository import EquipoCreate, DocumentoCreate


def get_user_equipos(
    db: Session,
    user_id: int,
    es_personal: Optional[bool] = None,
) -> List[EquipoEstudio]:
    """Obtiene los equipos o espacios del repositorio del estudiante."""
    query = db.query(EquipoEstudio).filter(EquipoEstudio.id_usuario == user_id)
    if es_personal is not None:
        query = query.filter(EquipoEstudio.es_personal == es_personal)
    return query.order_by(EquipoEstudio.fecha_creacion.asc()).all()


def get_equipo_by_id(
    db: Session,
    equipo_id: int,
    user_id: int,
) -> Optional[EquipoEstudio]:
    """Obtiene un equipo verificando pertenencia."""
    return (
        db.query(EquipoEstudio)
        .filter(
            EquipoEstudio.id_equipo == equipo_id,
            EquipoEstudio.id_usuario == user_id,
        )
        .first()
    )


def create_equipo(
    db: Session,
    equipo_in: EquipoCreate,
    user_id: int,
) -> EquipoEstudio:
    """Crea un nuevo equipo de estudio o espacio personal."""
    slug_invitacion = f"dalat-{uuid.uuid4().hex[:6]}"
    
    # Generar iniciales si no vienen especificadas
    iniciales = equipo_in.icono_iniciales or "EQ"
    if not equipo_in.icono_iniciales and equipo_in.nombre:
        words = equipo_in.nombre.split()
        if len(words) >= 2:
            iniciales = (words[0][:1] + words[1][:1]).upper()
        else:
            iniciales = words[0][:2].upper()

    db_equipo = EquipoEstudio(
        id_usuario=user_id,
        nombre=equipo_in.nombre.strip(),
        materia=equipo_in.materia.strip() if equipo_in.materia else "General",
        descripcion=equipo_in.descripcion.strip() if equipo_in.descripcion else None,
        icono_iniciales=iniciales,
        color=equipo_in.color or "#7c5dfa",
        es_personal=equipo_in.es_personal or False,
        codigo_invitacion=slug_invitacion,
        miembros_count=equipo_in.miembros_count or 1,
    )
    db.add(db_equipo)
    db.commit()
    db.refresh(db_equipo)
    return db_equipo


def delete_equipo(db: Session, db_equipo: EquipoEstudio) -> None:
    """Elimina un equipo y todos sus documentos asociados."""
    db.delete(db_equipo)
    db.commit()


def get_equipo_documentos(
    db: Session,
    equipo_id: int,
    user_id: int,
) -> List[DocumentoRepositorio]:
    """Lista todos los documentos de un equipo."""
    return (
        db.query(DocumentoRepositorio)
        .filter(
            DocumentoRepositorio.id_equipo == equipo_id,
            DocumentoRepositorio.id_usuario == user_id,
        )
        .order_by(DocumentoRepositorio.fecha_creacion.desc())
        .all()
    )


def get_all_user_documentos(
    db: Session,
    user_id: int,
) -> List[DocumentoRepositorio]:
    """Lista todos los documentos del repositorio de un estudiante (personales y grupales)."""
    return (
        db.query(DocumentoRepositorio)
        .filter(DocumentoRepositorio.id_usuario == user_id)
        .order_by(DocumentoRepositorio.fecha_creacion.desc())
        .all()
    )


def calculate_storage_used_mb(
    db: Session,
    user_id: int,
) -> float:
    """Calcula el tamaño total usado en MB por el estudiante."""
    docs = db.query(DocumentoRepositorio).filter(DocumentoRepositorio.id_usuario == user_id).all()
    total_mb = 0.0
    for d in docs:
        if d.tamano:
            t = d.tamano.upper().strip()
            try:
                if "MB" in t:
                    total_mb += float(t.replace("MB", "").strip())
                elif "KB" in t:
                    total_mb += float(t.replace("KB", "").strip()) / 1024.0
                elif "GB" in t:
                    total_mb += float(t.replace("GB", "").strip()) * 1024.0
            except ValueError:
                total_mb += 1.0
    return round(total_mb, 2)


def create_documento(
    db: Session,
    doc_in: DocumentoCreate,
    user_id: int,
) -> DocumentoRepositorio:
    """Registra un nuevo documento o recurso en un equipo."""
    db_doc = DocumentoRepositorio(
        id_usuario=user_id,
        id_equipo=doc_in.id_equipo,
        nombre=doc_in.nombre.strip(),
        formato=doc_in.formato.upper() if doc_in.formato else "PDF",
        tamano=doc_in.tamano.strip() if doc_in.tamano else "1.2 MB",
        url_recurso=doc_in.url_recurso.strip() if doc_in.url_recurso else None,
        autor_nombre=doc_in.autor_nombre.strip() if doc_in.autor_nombre else "Tú",
        descripcion=doc_in.descripcion.strip() if doc_in.descripcion else None,
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


def delete_documento(
    db: Session,
    doc_id: int,
    user_id: int,
) -> bool:
    """Elimina un documento."""
    db_doc = (
        db.query(DocumentoRepositorio)
        .filter(
            DocumentoRepositorio.id_documento == doc_id,
            DocumentoRepositorio.id_usuario == user_id,
        )
        .first()
    )
    if not db_doc:
        return False
    db.delete(db_doc)
    db.commit()
    return True


def seed_default_repository_for_user(db: Session, user_id: int) -> List[EquipoEstudio]:
    """Siembra los equipos de estudio y documentos iniciales de Dalat."""
    # 1. Equipos
    team1 = EquipoEstudio(
        id_usuario=user_id,
        nombre="Cálculo sin drama",
        materia="Cálculo III",
        icono_iniciales="CÁ",
        color="#7c5dfa",
        es_personal=False,
        codigo_invitacion="dalat-calc-sin-drama",
        miembros_count=4,
    )
    team2 = EquipoEstudio(
        id_usuario=user_id,
        nombre="Microeconomía",
        materia="Economía",
        icono_iniciales="MI",
        color="#10b981",
        es_personal=False,
        codigo_invitacion="dalat-microeconomia-eco",
        miembros_count=3,
    )
    team3 = EquipoEstudio(
        id_usuario=user_id,
        nombre="Proyecto final",
        materia="Arquitectura",
        icono_iniciales="PR",
        color="#f43f8e",
        es_personal=False,
        codigo_invitacion="dalat-proyecto-final-arq",
        miembros_count=2,
    )
    personal = EquipoEstudio(
        id_usuario=user_id,
        nombre="Mis Apuntes Personales",
        materia="General",
        icono_iniciales="AP",
        color="#38bdf8",
        es_personal=True,
        codigo_invitacion="dalat-mis-apuntes",
        miembros_count=1,
    )

    db.add_all([team1, team2, team3, personal])
    db.commit()
    db.refresh(team1)
    db.refresh(team2)
    db.refresh(team3)
    db.refresh(personal)

    # 2. Documentos
    docs = [
        DocumentoRepositorio(
            id_usuario=user_id,
            id_equipo=team1.id_equipo,
            nombre="Apuntes Cálculo III — Integrales dobles.pdf",
            formato="PDF",
            tamano="2.2 MB",
            autor_nombre="Luis Martínez",
        ),
        DocumentoRepositorio(
            id_usuario=user_id,
            id_equipo=team1.id_equipo,
            nombre="Guía parcial — Aplicaciones de integrales.docx",
            formato="MSWORD",
            tamano="439 KB",
            autor_nombre="Tú",
        ),
        DocumentoRepositorio(
            id_usuario=user_id,
            id_equipo=team2.id_equipo,
            nombre="Resumen Curva de Oferta y Demanda.pdf",
            formato="PDF",
            tamano="1.8 MB",
            autor_nombre="Carlos Ruiz",
        ),
        DocumentoRepositorio(
            id_usuario=user_id,
            id_equipo=team2.id_equipo,
            nombre="Taller Práctico de Elasticidades.docx",
            formato="MSWORD",
            tamano="312 KB",
            autor_nombre="Tú",
        ),
        DocumentoRepositorio(
            id_usuario=user_id,
            id_equipo=team3.id_equipo,
            nombre="Diagrama C4 y Arquitectura de Microservicios.pdf",
            formato="PDF",
            tamano="3.5 MB",
            autor_nombre="Daniel Granados",
        ),
        DocumentoRepositorio(
            id_usuario=user_id,
            id_equipo=personal.id_equipo,
            nombre="Formulario Maestro de Integrales y Derivadas.pdf",
            formato="PDF",
            tamano="850 KB",
            autor_nombre="Tú",
        ),
    ]

    db.add_all(docs)
    db.commit()

    return [team1, team2, team3, personal]
