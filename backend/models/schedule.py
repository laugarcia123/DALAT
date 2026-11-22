from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base


class HorarioClase(Base):
    __tablename__ = "horarios_clases"

    id_horario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False, index=True)
    id_asignatura = Column(Integer, ForeignKey("asignaturas.id_asignatura", ondelete="SET NULL"), nullable=True)

    titulo = Column(String(150), nullable=False)
    dia_semana = Column(Integer, nullable=False, index=True)  # 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
    hora_inicio = Column(String(10), nullable=False)  # Formato "HH:MM", ej: "07:30"
    hora_fin = Column(String(10), nullable=True)     # Formato "HH:MM", ej: "09:00"
    duracion_minutos = Column(Integer, default=90)
    lugar = Column(String(120), nullable=True, default="Aula")
    profesor = Column(String(120), nullable=True)
    color = Column(String(25), default="#818cf8")
    tipo = Column(String(50), default="clase")  # clase, laboratorio, tutoria, estudio

    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    usuario = relationship("Usuario", backref="horarios")
    asignatura = relationship("Asignatura", backref="horarios")
