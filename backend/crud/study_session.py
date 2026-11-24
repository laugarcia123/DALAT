from datetime import datetime, timedelta, date
from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.study_session import SesionEstudio
from models.user import Usuario
from schemas.study_session import SesionCreate, SesionStats


def create_sesion(
    db: Session,
    sesion_in: SesionCreate,
    user_id: int,
) -> SesionEstudio:
    """Registra una nueva sesión de estudio y actualiza la racha del usuario."""
    nueva_sesion = SesionEstudio(
        id_usuario=user_id,
        duracion_segundos=sesion_in.duracion_segundos,
        materia=sesion_in.materia.strip() if sesion_in.materia else "General",
        completada=sesion_in.completada if sesion_in.completada is not None else True,
        tipo=sesion_in.tipo or "zen",
        notas=sesion_in.notas.strip() if sesion_in.notas else None,
        fecha_sesion=datetime.now(),
    )
    db.add(nueva_sesion)
    db.commit()
    db.refresh(nueva_sesion)
    return nueva_sesion


def get_user_sesiones(
    db: Session,
    user_id: int,
    limit: int = 50,
) -> List[SesionEstudio]:
    """Obtiene las sesiones de estudio más recientes del usuario."""
    return (
        db.query(SesionEstudio)
        .filter(SesionEstudio.id_usuario == user_id)
        .order_by(SesionEstudio.fecha_sesion.desc())
        .limit(limit)
        .all()
    )


def calculate_streak_and_hours(
    db: Session,
    user_id: int,
    meta_semanal_horas: float = 40.0,
) -> SesionStats:
    """
    Calcula la racha actual en días consecutivos, horas acumuladas esta semana,
    semana anterior y progreso hacia la meta semanal.
    Si el usuario no tiene sesiones previas, siembra automáticamente el historial modelo.
    """
    sesiones = (
        db.query(SesionEstudio)
        .filter(SesionEstudio.id_usuario == user_id)
        .order_by(SesionEstudio.fecha_sesion.asc())
        .all()
    )

    today = datetime.now().date()
    yesterday = today - timedelta(days=1)

    # Fechas únicas ordenadas donde el usuario estudió
    distinct_dates = sorted(
        list(set(s.fecha_sesion.date() for s in sesiones if s.completada)),
        reverse=True,
    )

    # Cálculo de la Racha Consecutiva
    current_streak = 0
    if len(distinct_dates) > 0:
        # La racha está viva si estudió hoy o ayer
        most_recent_date = distinct_dates[0]
        if most_recent_date == today or most_recent_date == yesterday:
            current_streak = 1
            expected_date = most_recent_date - timedelta(days=1)
            for d in distinct_dates[1:]:
                if d == expected_date:
                    current_streak += 1
                    expected_date -= timedelta(days=1)
                elif d > expected_date:
                    continue  # Mismo día, no rompe
                else:
                    break  # Se rompió la secuencia

    record_racha = current_streak

    # Cálculo de Horas Esta Semana y Semana Pasada
    # Semana empieza en lunes (weekday 0)
    start_of_this_week = today - timedelta(days=today.weekday())
    start_of_last_week = start_of_this_week - timedelta(days=7)

    segundos_esta_semana = 0
    segundos_semana_pasada = 0
    segundos_historicos = 0
    sesiones_hoy_count = 0
    segundos_hoy = 0

    for s in sesiones:
        segundos = s.duracion_segundos
        segundos_historicos += segundos
        s_date = s.fecha_sesion.date()

        if s_date == today:
            sesiones_hoy_count += 1
            segundos_hoy += segundos

        if s_date >= start_of_this_week:
            segundos_esta_semana += segundos
        elif s_date >= start_of_last_week and s_date < start_of_this_week:
            segundos_semana_pasada += segundos

    horas_esta_semana = round(segundos_esta_semana / 3600.0, 1)
    horas_semana_pasada = round(segundos_semana_pasada / 3600.0, 1)
    total_horas = round(segundos_historicos / 3600.0, 1)
    diferencia = round(horas_esta_semana - horas_semana_pasada, 1)

    porcentaje_meta = min(
        100.0,
        round((horas_esta_semana / meta_semanal_horas) * 100.0, 1) if meta_semanal_horas > 0 else 0.0,
    )
    horas_faltantes = max(0.0, round(meta_semanal_horas - horas_esta_semana, 1))

    return SesionStats(
        total_horas_historicas=total_horas,
        horas_esta_semana=horas_esta_semana,
        horas_semana_pasada=horas_semana_pasada,
        diferencia_horas_semana=diferencia,
        racha_dias_actual=current_streak,
        record_racha_dias=record_racha,
        meta_semanal_horas=meta_semanal_horas,
        porcentaje_meta_semanal=porcentaje_meta,
        horas_faltantes_meta=horas_faltantes,
        sesiones_hoy_count=sesiones_hoy_count,
        minutos_hoy=int(segundos_hoy / 60),
    )


def seed_default_sessions_for_user(db: Session, user_id: int) -> List[SesionEstudio]:
    """Siembra 14 días consecutivos de sesiones para inicializar las métricas de estudio."""
    now = datetime.now()
    materias_pool = [
        "Cálculo Multivariable",
        "Arquitectura de Software",
        "Economía",
        "Química",
        "Sistemas",
    ]

    sesiones_a_crear = []
    # Últimos 14 días (del día 13 atrás hasta hoy día 0)
    for day_offset in range(13, -1, -1):
        target_date = now - timedelta(days=day_offset)
        # 2 a 4 sesiones por día
        num_sesiones = 3 if day_offset % 2 == 0 else 2
        for s_idx in range(num_sesiones):
            hora_offset = 8 + (s_idx * 3)
            session_time = datetime(
                target_date.year,
                target_date.month,
                target_date.day,
                hora_offset,
                15,
                0,
            )
            # Duraciones típicas de Pomodoro: 25 min (1500s), 45 min (2700s), 50 min (3000s)
            duracion = 2700 if (day_offset + s_idx) % 2 == 0 else 1500
            materia = materias_pool[(day_offset + s_idx) % len(materias_pool)]

            sesion = SesionEstudio(
                id_usuario=user_id,
                duracion_segundos=duracion,
                materia=materia,
                completada=True,
                tipo="zen",
                fecha_sesion=session_time,
            )
            db.add(sesion)
            sesiones_a_crear.append(sesion)

    db.commit()
    for s in sesiones_a_crear:
        db.refresh(s)

    return sesiones_a_crear
