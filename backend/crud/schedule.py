from typing import List, Optional
from sqlalchemy.orm import Session
from models.schedule import HorarioClase
from schemas.schedule import HorarioCreate, HorarioUpdate


def get_user_schedule(
    db: Session,
    user_id: int,
    dia_semana: Optional[int] = None,
) -> List[HorarioClase]:
    """Obtiene el horario de clases del estudiante ordenado por día y hora de inicio."""
    query = db.query(HorarioClase).filter(HorarioClase.id_usuario == user_id)
    if dia_semana is not None:
        query = query.filter(HorarioClase.dia_semana == dia_semana)
    return query.order_by(HorarioClase.dia_semana.asc(), HorarioClase.hora_inicio.asc()).all()


def get_schedule_item_by_id(
    db: Session,
    schedule_id: int,
    user_id: int,
) -> Optional[HorarioClase]:
    """Obtiene un bloque de clase específico asegurando pertenencia al usuario."""
    return (
        db.query(HorarioClase)
        .filter(
            HorarioClase.id_horario == schedule_id,
            HorarioClase.id_usuario == user_id,
        )
        .first()
    )


def create_schedule_item(
    db: Session,
    item_in: HorarioCreate,
    user_id: int,
) -> HorarioClase:
    """Registra una nueva clase o bloque en el horario."""
    db_item = HorarioClase(
        id_usuario=user_id,
        id_asignatura=item_in.id_asignatura,
        titulo=item_in.titulo.strip(),
        dia_semana=item_in.dia_semana,
        hora_inicio=item_in.hora_inicio.strip(),
        hora_fin=item_in.hora_fin.strip() if item_in.hora_fin else None,
        duracion_minutos=item_in.duracion_minutos or 90,
        lugar=item_in.lugar.strip() if item_in.lugar else "Aula",
        profesor=item_in.profesor.strip() if item_in.profesor else None,
        color=item_in.color or "#818cf8",
        tipo=item_in.tipo or "clase",
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_schedule_item(
    db: Session,
    db_item: HorarioClase,
    item_in: HorarioUpdate,
) -> HorarioClase:
    """Actualiza los campos de un bloque de clase existente."""
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None and isinstance(value, str):
            setattr(db_item, field, value.strip())
        else:
            setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item


def delete_schedule_item(db: Session, db_item: HorarioClase) -> None:
    """Elimina un bloque del horario."""
    db.delete(db_item)
    db.commit()


def seed_default_schedule_for_user(db: Session, user_id: int) -> List[HorarioClase]:
    """Siembra un horario universitario completo modelo para estudiantes nuevos."""
    default_classes = [
        # Lunes (dia 1)
        {
            "titulo": "Cálculo Multivariable",
            "dia_semana": 1,
            "hora_inicio": "07:30",
            "hora_fin": "09:00",
            "duracion_minutos": 90,
            "lugar": "Aula 204",
            "color": "#818cf8",
            "tipo": "clase",
        },
        {
            "titulo": "Arquitectura de Software",
            "dia_semana": 1,
            "hora_inicio": "10:00",
            "hora_fin": "11:30",
            "duracion_minutos": 90,
            "lugar": "Lab 3",
            "color": "#f59e0b",
            "tipo": "clase",
        },
        # Martes (dia 2)
        {
            "titulo": "Física Mecánica",
            "dia_semana": 2,
            "hora_inicio": "08:00",
            "hora_fin": "10:00",
            "duracion_minutos": 120,
            "lugar": "Aula 102",
            "color": "#f43f5e",
            "tipo": "clase",
        },
        {
            "titulo": "Álgebra Lineal",
            "dia_semana": 2,
            "hora_inicio": "10:30",
            "hora_fin": "12:00",
            "duracion_minutos": 90,
            "lugar": "Aula 205",
            "color": "#c084fc",
            "tipo": "clase",
        },
        # Miércoles (dia 3)
        {
            "titulo": "Cálculo Multivariable",
            "dia_semana": 3,
            "hora_inicio": "07:30",
            "hora_fin": "09:00",
            "duracion_minutos": 90,
            "lugar": "Aula 204",
            "color": "#818cf8",
            "tipo": "clase",
        },
        {
            "titulo": "Arquitectura de Software",
            "dia_semana": 3,
            "hora_inicio": "10:00",
            "hora_fin": "11:30",
            "duracion_minutos": 90,
            "lugar": "Sala Virtual",
            "color": "#f59e0b",
            "tipo": "clase",
        },
        {
            "titulo": "Almuerzo + descanso",
            "dia_semana": 3,
            "hora_inicio": "13:00",
            "hora_fin": "14:00",
            "duracion_minutos": 60,
            "lugar": "Cafetería",
            "color": "#f59e0b",
            "tipo": "estudio",
        },
        {
            "titulo": "Revisión de apuntes",
            "dia_semana": 3,
            "hora_inicio": "16:00",
            "hora_fin": "17:00",
            "duracion_minutos": 60,
            "lugar": "Casa / Biblioteca",
            "color": "#10b981",
            "tipo": "estudio",
        },
        # Jueves (dia 4)
        {
            "titulo": "Física Mecánica - Lab",
            "dia_semana": 4,
            "hora_inicio": "08:00",
            "hora_fin": "10:00",
            "duracion_minutos": 120,
            "lugar": "Lab Física 1",
            "color": "#f43f5e",
            "tipo": "laboratorio",
        },
        {
            "titulo": "Base de Datos",
            "dia_semana": 4,
            "hora_inicio": "10:30",
            "hora_fin": "12:00",
            "duracion_minutos": 90,
            "lugar": "Lab 2",
            "color": "#38bdf8",
            "tipo": "clase",
        },
        # Viernes (dia 5)
        {
            "titulo": "Ética Profesional",
            "dia_semana": 5,
            "hora_inicio": "09:00",
            "hora_fin": "11:00",
            "duracion_minutos": 120,
            "lugar": "Aula 301",
            "color": "#fb923c",
            "tipo": "clase",
        },
        {
            "titulo": "Seminario de Proyectos",
            "dia_semana": 5,
            "hora_inicio": "14:00",
            "hora_fin": "16:00",
            "duracion_minutos": 120,
            "lugar": "Auditorio B",
            "color": "#a78bfa",
            "tipo": "clase",
        },
    ]

    items = []
    for data in default_classes:
        item = HorarioClase(
            id_usuario=user_id,
            titulo=data["titulo"],
            dia_semana=data["dia_semana"],
            hora_inicio=data["hora_inicio"],
            hora_fin=data["hora_fin"],
            duracion_minutos=data["duracion_minutos"],
            lugar=data["lugar"],
            color=data["color"],
            tipo=data["tipo"],
        )
        db.add(item)
        items.append(item)

    db.commit()
    for item in items:
        db.refresh(item)
    return items
