from typing import List, Optional, Any, Union
from pydantic import BaseModel, Field


class PreguntaExamen(BaseModel):
    id: int
    pregunta: str
    opciones: List[str] = Field(..., min_length=2, max_length=5)
    indice_correcto: int = Field(..., ge=0, le=4)
    explicacion: str


class FlashcardItem(BaseModel):
    id: int
    anverso: str  # Pregunta, concepto o fórmula
    reverso: str  # Definición, explicación o solución
    categoria: Optional[str] = "Concepto Clave"
    dificultad: Optional[str] = "Intermedio"


class ResumenGuiaItem(BaseModel):
    titulo: str
    resumen_markdown: str
    puntos_clave: List[str]
    formulas_o_conceptos: List[str]


class GenerarRecursoRequest(BaseModel):
    tipo_recurso: str = Field("Examen", description="Examen, Flashcards, Resumen o Guia")
    materia: str = Field(..., description="Nombre de la asignatura, ej: Cálculo III")
    tema: str = Field(..., description="Tema específico, ej: Integrales Múltiples")
    dificultad: Optional[str] = "Intermedio"
    cantidad: Optional[int] = Field(10, ge=3, le=25)
    archivo_nombre: Optional[str] = None
    texto_adicional: Optional[str] = None


class GenerarRecursoResponse(BaseModel):
    id_recurso: Union[int, str]
    tipo_recurso: str
    materia: str
    tema: str
    dificultad: str
    fuente: str  # cache, gemini, groq, openrouter, heuristico_local
    tiempo_generacion_ms: int
    contenido: Any
