from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base


class Tarea(Base):
    __tablename__ = "tareas"

    id_tarea: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), index=True, nullable=False
    )

    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    materia: Mapped[str] = mapped_column(String(150), default="General")
    columna: Mapped[str] = mapped_column(String(50), default="urgente")  # urgente, en_progreso, para_despues
    completada: Mapped[bool] = mapped_column(Boolean, default=False)
    prioridad: Mapped[str] = mapped_column(String(50), default="media")  # baja, media, alta, urgente
    fecha_limite: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relación
    usuario: Mapped["Usuario"] = relationship("Usuario", backref="tareas")
