from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class DocumentoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=200)
    formato: Optional[str] = "PDF"
    tamano: Optional[str] = "1.0 MB"
    url_recurso: Optional[str] = None
    autor_nombre: Optional[str] = "Tú"
    descripcion: Optional[str] = None
    id_equipo: Optional[int] = None


class DocumentoCreate(DocumentoBase):
    pass


class DocumentoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class DocumentoResponse(DocumentoBase):
    id_documento: int
    id_usuario: int
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class EquipoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120)
    materia: Optional[str] = "General"
    descripcion: Optional[str] = None
    icono_iniciales: Optional[str] = "EQ"
    color: Optional[str] = "#7c5dfa"
    es_personal: Optional[bool] = False
    miembros_count: Optional[int] = 1


class EquipoCreate(EquipoBase):
    pass


class EquipoResponse(EquipoBase):
    id_equipo: int
    id_usuario: int
    codigo_invitacion: Optional[str] = None
    documentos_count: Optional[int] = 0
    fecha_creacion: Optional[datetime] = None
    documentos: Optional[List[DocumentoResponse]] = []
    es_miembro: Optional[bool] = False
    es_creador: Optional[bool] = False
    rol_usuario: Optional[str] = None

    class Config:
        from_attributes = True


class UnirseEquipoRequest(BaseModel):
    codigo_invitacion: str = Field(..., min_length=2, max_length=150)

