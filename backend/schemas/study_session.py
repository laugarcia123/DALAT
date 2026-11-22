from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SesionCreate(BaseModel):
    duracion_segundos: int = Field(..., ge=10, description="Duración de la sesión en segundos")
    materia: Optional[str] = "General"
    completada: Optional[bool] = True
    tipo: Optional[str] = "zen"
    notas: Optional[str] = None


class SesionResponse(BaseModel):
    id_sesion: int
    id_usuario: int
    duracion_segundos: int
    materia: str
    completada: bool
    tipo: str
    notas: Optional[str] = None
    fecha_sesion: datetime

    class Config:
        from_attributes = True


class SesionStats(BaseModel):
    total_horas_historicas: float
    horas_esta_semana: float
    horas_semana_pasada: float
    diferencia_horas_semana: float
    racha_dias_actual: int
    record_racha_dias: int
    meta_semanal_horas: float
    porcentaje_meta_semanal: float
    horas_faltantes_meta: float
    sesiones_hoy_count: int
    minutos_hoy: int
