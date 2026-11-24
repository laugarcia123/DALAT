import sys
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from db.database import SessionLocal, Base, engine
import models.user
import models.subject
import models.task
import models.schedule
from schemas.schedule import HorarioCreate, HorarioUpdate
from schemas.user import UserCreate
from crud.user import create_user, get_user_by_email
from crud.schedule import (
    get_user_schedule,
    get_schedule_item_by_id,
    create_schedule_item,
    update_schedule_item,
    delete_schedule_item,
    seed_default_schedule_for_user,
)


def run():
    print("[TEST HORARIO] Inicializando tablas...")
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

        # 1. Obtener horario y sembrar si está vacío
        clases = get_user_schedule(db, user_id=user.id_usuario)
        if len(clases) == 0:
            clases = seed_default_schedule_for_user(db, user_id=user.id_usuario)
        print(f"[OK] Total clases cargadas/sembradas: {len(clases)}")
        assert len(clases) >= 10, "Deben haber al menos 10 clases sembradas"

        # 2. Filtrar por día (Miércoles = 3)
        miercoles_clases = get_user_schedule(db, user_id=user.id_usuario, dia_semana=3)
        print(f"[OK] Clases del Miércoles (día 3): {len(miercoles_clases)}")
        assert len(miercoles_clases) >= 3, "El miércoles debe tener clases"

        # 3. Crear clase personalizada
        print("\n--- Crear Clase Personalizada ---")
        nueva_clase = create_schedule_item(
            db,
            HorarioCreate(
                titulo="Taller Especial de Redes Neuronales",
                dia_semana=4,  # Jueves
                hora_inicio="14:00",
                hora_fin="16:00",
                duracion_minutos=120,
                lugar="Laboratorio de Inteligencia Artificial",
                profesor="Dr. Granados",
                color="#6366f1",
                tipo="laboratorio",
            ),
            user_id=user.id_usuario,
        )
        print(f"[OK] Clase creada: ID {nueva_clase.id_horario}, Título: '{nueva_clase.titulo}', Lugar: {nueva_clase.lugar}")
        assert nueva_clase.id_horario is not None

        # 4. Actualizar clase
        print("\n--- Actualizar Horario y Salón ---")
        clase_act = update_schedule_item(
            db,
            db_item=nueva_clase,
            item_in=HorarioUpdate(
                lugar="Edificio C - Aula Magna",
                duracion_minutos=130,
            ),
        )
        print(f"[OK] Clase actualizada: Lugar='{clase_act.lugar}', Duración={clase_act.duracion_minutos}min")
        assert clase_act.lugar == "Edificio C - Aula Magna"

        # 5. Eliminar clase de prueba
        delete_schedule_item(db, db_item=clase_act)
        verif = get_schedule_item_by_id(db, schedule_id=nueva_clase.id_horario, user_id=user.id_usuario)
        assert verif is None
        print("[OK] Clase de prueba eliminada exitosamente.")

        print("\n=======================================================")
        print(">>> MODULO DE HORARIO Y CALENDARIO FUNCIONA AL 100% <<<")
        print("=======================================================")

    finally:
        db.close()


if __name__ == "__main__":
    run()
