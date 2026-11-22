import sys
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from db.database import SessionLocal, Base, engine
import models.user
import models.subject
import models.ai_resource
import models.task
import models.schedule
import models.repository
import models.study_session
from schemas.study_session import SesionCreate
from schemas.user import UserCreate
from crud.user import create_user, get_user_by_email
from crud.study_session import (
    create_sesion,
    get_user_sesiones,
    calculate_streak_and_hours,
)


def run():
    print("[TEST SESIONES & RACHA] Inicializando tablas...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        email_test = "andrea.gomez@dalat.edu"
        user = get_user_by_email(db, email=email_test)
        if not user:
            user = create_user(
                db,
                UserCreate(
                    nombre="Andrea Gomez",
                    email=email_test,
                    password="Password123!",
                ),
            )
        print(f"[OK] Usuario: {user.nombre} (ID: {user.id_usuario})")

        # 1. Calcular estadísticas y sembrar si es nuevo
        stats = calculate_streak_and_hours(db, user_id=user.id_usuario)
        print(f"[OK] Racha Actual: {stats.racha_dias_actual} días consecutivos (Récord: {stats.record_racha_dias})")
        print(f"[OK] Horas esta semana: {stats.horas_esta_semana}h (vs semana anterior: {stats.horas_semana_pasada}h, dif: {stats.diferencia_horas_semana:+}h)")
        print(f"[OK] Total histórico: {stats.total_horas_historicas}h | Meta: {stats.porcentaje_meta_semanal}% ({stats.horas_faltantes_meta}h restantes)")
        assert stats.racha_dias_actual >= 14, "La racha sembrada debe ser de al menos 14 días"
        assert stats.horas_esta_semana > 0, "Debe tener horas registradas esta semana"

        # 2. Registrar una nueva sesión Pomodoro / Modo Zen completada
        print("\n--- Registrar Sesión Modo Zen de 25 minutos ---")
        nueva_sesion = create_sesion(
            db,
            SesionCreate(
                duracion_segundos=1500,  # 25 minutos
                materia="Cálculo Multivariable",
                completada=True,
                tipo="zen",
                notas="Resolución de integrales dobles en coordenadas polares",
            ),
            user_id=user.id_usuario,
        )
        print(f"[OK] Sesión registrada: ID {nueva_sesion.id_sesion}, Duración: {nueva_sesion.duracion_segundos}s, Materia: {nueva_sesion.materia}")
        assert nueva_sesion.id_sesion is not None

        # 3. Verificar recálculo de estadísticas
        stats_nuevas = calculate_streak_and_hours(db, user_id=user.id_usuario)
        print(f"[OK] Nuevas Horas Esta Semana: {stats_nuevas.horas_esta_semana}h")
        print(f"[OK] Minutos estudiados hoy: {stats_nuevas.minutos_hoy} min en {stats_nuevas.sesiones_hoy_count} sesiones")
        assert stats_nuevas.minutos_hoy >= 25

        # 4. Verificar sincronización en el modelo Usuario
        db.refresh(user)
        print(f"[OK] Usuario sincronizado: studyStreakDays={user.studyStreakDays}, totalStudyHours={user.totalStudyHours}")
        assert user.studyStreakDays >= 14

        print("\n=======================================================")
        print(">>> MODULO DE SESIONES Y RACHA FUNCIONA AL 100% <<<")
        print("=======================================================")

    finally:
        db.close()


if __name__ == "__main__":
    run()
