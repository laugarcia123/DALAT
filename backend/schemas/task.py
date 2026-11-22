from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TareaBase(BaseModel):
    titulo: str
    materia: Optional[str] = "General"
    columna: Optional[str] = "urgente"  # urgente, en_progreso, para_despues
    completada: Optional[bool] = False
    prioridad: Optional[str] = "media"
    fecha_limite: Optional[str] = None


class TareaCreate(TareaBase):
    pass


class TareaUpdate(BaseModel):
    titulo: Optional[str] = None
    materia: Optional[str] = None
    columna: Optional[str] = None
    completada: Optional[bool] = None
    prioridad: Optional[str] = None
    fecha_limite: Optional[str] = None


class TareaResponse(TareaBase):
    id_tarea: int
    id_usuario: int
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
