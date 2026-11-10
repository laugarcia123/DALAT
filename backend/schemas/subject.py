from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field


# ----------------------------------------------------
# Esquemas para Evaluaciones / Calificaciones
# ----------------------------------------------------

class EvaluacionBase(BaseModel):
    nombre: str
    tipo: Optional[str] = "Parcial"
    corte: Optional[int] = 1
    nota: Optional[float] = None
    max_nota: Optional[float] = 5.0
    peso_porcentaje: float = Field(..., gt=0, le=100, description="Peso porcentual de la evaluación (0 a 100)")
    fecha: Optional[str] = None
    completada: Optional[bool] = False
    retroalimentacion: Optional[str] = None


class EvaluacionCreate(EvaluacionBase):
    pass


class EvaluacionUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    corte: Optional[int] = None
    nota: Optional[float] = None
    max_nota: Optional[float] = None
    peso_porcentaje: Optional[float] = None
    fecha: Optional[str] = None
    completada: Optional[bool] = None
    retroalimentacion: Optional[str] = None


class EvaluacionResponse(EvaluacionBase):
    id_evaluacion: int
    id_asignatura: int
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Estadísticas y Diagnóstico Académico
# ----------------------------------------------------

class AsignaturaStats(BaseModel):
    promedio_actual: Optional[float] = Field(None, description="Promedio ponderado de las notas ya calificadas")
    porcentaje_evaluado: float = Field(0.0, description="Suma de pesos calificados (0 a 100)")
    porcentaje_restante: float = Field(100.0, description="Porcentaje aún por calificar")
    nota_acumulada: float = Field(0.0, description="Puntos reales aportados al 100% de la asignatura")
    nota_necesaria_para_aprobar: Optional[float] = Field(None, description="Nota promedio necesaria en el porcentaje restante para aprobar")
    es_alcanzable: bool = Field(True, description="Indica si matemáticamente aún es posible aprobar")
    estado_estimado: str = Field("en curso", description="aprobada asegurada, aprobando, en riesgo, reprobada")
    mensaje_diagnostico: str = Field("", description="Mensaje explicativo para el estudiante")


class CorteSummary(BaseModel):
    corte: int
    promedio: Optional[float] = None
    porcentaje_total: float = 0.0
    porcentaje_evaluado: float = 0.0
    evaluaciones: List[EvaluacionResponse] = []


# ----------------------------------------------------
# Esquemas para Asignaturas
# ----------------------------------------------------

class AsignaturaBase(BaseModel):
    nombre: str
    codigo: Optional[str] = None
    profesor: Optional[str] = None
    creditos: Optional[int] = 3
    color: Optional[str] = "#7c5dfa"
    icono: Optional[str] = "book"
    periodo: Optional[str] = None
    escala_maxima: Optional[float] = 5.0
    nota_aprobatoria: Optional[float] = 3.0
    estado: Optional[str] = "cursando"


class AsignaturaCreate(AsignaturaBase):
    evaluaciones_iniciales: Optional[List[EvaluacionCreate]] = None


class AsignaturaUpdate(BaseModel):
    nombre: Optional[str] = None
    codigo: Optional[str] = None
    profesor: Optional[str] = None
    creditos: Optional[int] = None
    color: Optional[str] = None
    icono: Optional[str] = None
    periodo: Optional[str] = None
    escala_maxima: Optional[float] = None
    nota_aprobatoria: Optional[float] = None
    estado: Optional[str] = None


class AsignaturaResponse(AsignaturaBase):
    id_asignatura: int
    id_usuario: int
    fecha_creacion: Optional[datetime] = None
    stats: Optional[AsignaturaStats] = None

    class Config:
        from_attributes = True


class AsignaturaDetailResponse(AsignaturaResponse):
    evaluaciones: List[EvaluacionResponse] = []
    cortes: Optional[List[CorteSummary]] = None


# ----------------------------------------------------
# Calculadora Rápida Independiente (Widget de UI)
# ----------------------------------------------------

class CalculadoraItem(BaseModel):
    nombre: Optional[str] = "Evaluación"
    nota: Optional[float] = None
    peso_porcentaje: float = Field(..., gt=0, le=100)


class CalculadoraRequest(BaseModel):
    escala_maxima: Optional[float] = 5.0
    nota_aprobatoria: Optional[float] = 3.0
    evaluaciones: List[CalculadoraItem]


class CalculadoraResponse(BaseModel):
    promedio_ponderado: Optional[float] = None
    porcentaje_evaluado: float = 0.0
    porcentaje_restante: float = 100.0
    nota_acumulada: float = 0.0
    nota_necesaria_para_aprobar: Optional[float] = None
    es_alcanzable: bool = True
    estado: str = "en curso"
    mensaje_diagnostico: str = ""
