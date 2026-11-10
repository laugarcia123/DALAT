from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base


class RecursoIA(Base):
    __tablename__ = "recursos_ia_cache"

    id_recurso: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    id_usuario: Mapped[Optional[int]] = mapped_column(
        ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True, index=True
    )

    tipo_recurso: Mapped[str] = mapped_column(String(50), index=True)  # Examen, Flashcards, Resumen, Guia
    materia: Mapped[str] = mapped_column(String(150), index=True)
    tema: Mapped[str] = mapped_column(String(250), index=True)
    dificultad: Mapped[str] = mapped_column(String(50), default="Intermedio")
    cantidad: Mapped[int] = mapped_column(Integer, default=10)

    fuente: Mapped[str] = mapped_column(String(50), default="heuristico_local")  # gemini, groq, openrouter, heuristico_local
    contenido_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON serializado con las preguntas/tarjetas

    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
