from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base


class Asignatura(Base):
    __tablename__ = "asignaturas"

    id_asignatura: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), index=True, nullable=False
    )

    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    codigo: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    profesor: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    creditos: Mapped[int] = mapped_column(Integer, default=3)
    color: Mapped[str] = mapped_column(String(50), default="#7c5dfa")
    icono: Mapped[Optional[str]] = mapped_column(String(50), default="book")
    periodo: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Configuración de escala de calificaciones (e.g. 5.0 o 10.0 o 100.0)
    escala_maxima: Mapped[float] = mapped_column(Float, default=5.0)
    nota_aprobatoria: Mapped[float] = mapped_column(Float, default=3.0)
    estado: Mapped[str] = mapped_column(String(50), default="cursando")  # cursando, aprobada, reprobada, archivada

    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relaciones
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="asignaturas")
    evaluaciones: Mapped[List["Evaluacion"]] = relationship(
        "Evaluacion",
        back_populates="asignatura",
        cascade="all, delete-orphan",
        order_by="Evaluacion.corte, Evaluacion.id_evaluacion",
    )


class Evaluacion(Base):
    __tablename__ = "evaluaciones"

    id_evaluacion: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    id_asignatura: Mapped[int] = mapped_column(
        ForeignKey("asignaturas.id_asignatura", ondelete="CASCADE"), index=True, nullable=False
    )

    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    tipo: Mapped[str] = mapped_column(String(50), default="Parcial")  # Parcial, Taller, Quiz, Proyecto, Examen, Tarea
    corte: Mapped[int] = mapped_column(Integer, default=1)           # Corte 1, 2, 3...
    nota: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_nota: Mapped[float] = mapped_column(Float, default=5.0)
    peso_porcentaje: Mapped[float] = mapped_column(Float, nullable=False)  # Porcentaje ponderado (ej: 25.0)
    fecha: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    completada: Mapped[bool] = mapped_column(Boolean, default=False)
    retroalimentacion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relación
    asignatura: Mapped["Asignatura"] = relationship("Asignatura", back_populates="evaluaciones")
