from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from db.database import Base


class SesionEstudio(Base):
    __tablename__ = "sesiones_estudio"

    id_sesion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False, index=True)

    duracion_segundos = Column(Integer, nullable=False, default=1500)  # Ej: 1500s = 25 min
    materia = Column(String(100), default="General")
    completada = Column(Boolean, default=True)
    tipo = Column(String(50), default="zen")  # zen, pomodoro, libre
    notas = Column(String(250), nullable=True)

    fecha_sesion = Column(DateTime, default=datetime.now, index=True)

    # Relación
    usuario = relationship("Usuario", backref="sesiones_estudio")
