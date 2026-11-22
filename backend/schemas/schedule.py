from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class HorarioBase(BaseModel):
    titulo: str = Field(..., min_length=2, max_length=150)
    dia_semana: int = Field(..., ge=1, le=7, description="1=Lunes a 7=Domingo")
    hora_inicio: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="Formato HH:MM 24h")
    hora_fin: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    duracion_minutos: Optional[int] = 90
    lugar: Optional[str] = "Aula"
    profesor: Optional[str] = None
    color: Optional[str] = "#818cf8"
    tipo: Optional[str] = "clase"
    id_asignatura: Optional[int] = None


class HorarioCreate(HorarioBase):
    pass


class HorarioUpdate(BaseModel):
    titulo: Optional[str] = None
    dia_semana: Optional[int] = Field(None, ge=1, le=7)
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    duracion_minutos: Optional[int] = None
    lugar: Optional[str] = None
    profesor: Optional[str] = None
    color: Optional[str] = None
    tipo: Optional[str] = None
    id_asignatura: Optional[int] = None


class HorarioResponse(HorarioBase):
    id_horario: int
    id_usuario: int
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
