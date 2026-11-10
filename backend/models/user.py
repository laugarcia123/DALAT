import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base


class TipoPlan(str, enum.Enum):
    BASICO = "basico"
    PRO = "pro"
    INSTITUCIONAL = "institucional"
    MICRO = "micro"  # microsuscripciones de 1 o 2 semanas


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Información Académica y Personalización
    carrera: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    universidad: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    semestre: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    biografia: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    avatar_color: Mapped[Optional[str]] = mapped_column(String(50), default="#7c5dfa")
    es_institucional: Mapped[bool] = mapped_column(Boolean, default=False)

    # Control del Modelo de Negocio / Suscripción
    tipo_plan: Mapped[TipoPlan] = mapped_column(SQLEnum(TipoPlan), default=TipoPlan.BASICO)
    fecha_fin_suscripcion: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Banderas de estado y auditoría
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_registro: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relación con asignaturas académicas
    asignaturas: Mapped[List["Asignatura"]] = relationship(
        "Asignatura", back_populates="usuario", cascade="all, delete-orphan"
    )
