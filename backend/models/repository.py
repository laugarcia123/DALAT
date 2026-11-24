from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from db.database import Base


class EquipoEstudio(Base):
    __tablename__ = "equipos_estudio"

    id_equipo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False, index=True)

    nombre = Column(String(120), nullable=False)
    materia = Column(String(100), default="General")
    descripcion = Column(Text, nullable=True)
    icono_iniciales = Column(String(10), default="EQ")
    color = Column(String(30), default="#7c5dfa")
    es_personal = Column(Boolean, default=False)
    codigo_invitacion = Column(String(50), nullable=True)
    miembros_count = Column(Integer, default=1)

    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    usuario = relationship("Usuario", backref="equipos_creados")
    documentos = relationship("DocumentoRepositorio", back_populates="equipo", cascade="all, delete-orphan")
    miembros = relationship("MiembroEquipo", back_populates="equipo", cascade="all, delete-orphan")


class MiembroEquipo(Base):
    __tablename__ = "equipo_miembros"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_equipo = Column(Integer, ForeignKey("equipos_estudio.id_equipo", ondelete="CASCADE"), nullable=False, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False, index=True)
    rol = Column(String(50), default="miembro")  # creador, miembro
    fecha_union = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    equipo = relationship("EquipoEstudio", back_populates="miembros")
    usuario = relationship("Usuario", backref="equipos_unidos")


class DocumentoRepositorio(Base):
    __tablename__ = "documentos_repositorio"

    id_documento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_equipo = Column(Integer, ForeignKey("equipos_estudio.id_equipo", ondelete="CASCADE"), nullable=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False, index=True)

    nombre = Column(String(200), nullable=False)
    formato = Column(String(20), default="PDF")  # PDF, MSWORD, PPT, LINK, NOTION, ZIP
    tamano = Column(String(30), default="1.2 MB")
    url_recurso = Column(String(500), nullable=True)
    autor_nombre = Column(String(100), default="Tú")
    descripcion = Column(Text, nullable=True)

    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    equipo = relationship("EquipoEstudio", back_populates="documentos")
    usuario = relationship("Usuario", backref="documentos_subidos")
