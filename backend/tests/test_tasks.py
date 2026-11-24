import sys
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from db.database import SessionLocal, Base, engine
import models.user
import models.subject
import models.task
from schemas.task import TareaCreate, TareaUpdate
from schemas.user import UserCreate
from crud.user import create_user, get_user_by_email
from crud.task import (
    get_user_tasks,
    get_task_by_id,
    create_task,
    update_task,
    delete_task,
    seed_default_tasks_for_user,
)

def run():
    print("[TEST TAREAS] Inicializando tablas...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Obtener usuario de prueba
        email_test = "andrea.gomez@dalat.edu"
        user = get_user_by_email(db, email=email_test)
        if not user:
            user = create_user(
                db,
                UserCreate(
                    nombre="Andrea Gomez",
                    email=email_test,
                    password="Password123!",
                )
            )
        print(f"[OK] Usuario: {user.nombre} (ID: {user.id_usuario})")

        # 2. Sembrar o listar tareas iniciales
        tasks = get_user_tasks(db, user_id=user.id_usuario)
        if len(tasks) == 0:
            tasks = seed_default_tasks_for_user(db, user_id=user.id_usuario)
            print(f"[OK] Tareas sembradas exitosamente: {len(tasks)}")
        else:
            print(f"[OK] Tareas existentes en BD: {len(tasks)}")

        assert len(tasks) >= 3

        # 3. Crear una nueva tarea
        print("\n--- Crear Tarea Personalizada ---")
        new_task = create_task(
            db,
            task_in=TareaCreate(
                titulo="Resolver taller de integrales de línea",
                materia="Cálculo III",
                columna="urgente",
                prioridad="alta"
            ),
            user_id=user.id_usuario
        )
        print(f"[OK] Tarea creada: ID {new_task.id_tarea}, Título: '{new_task.titulo}'")
        assert new_task.columna == "urgente"
        assert new_task.completada is False

        # 4. Actualizar estado y mover a "en_progreso"
        print("\n--- Mover Tarea a 'en_progreso' y marcar completada ---")
        updated = update_task(
            db,
            db_task=new_task,
            task_in=TareaUpdate(columna="en_progreso", completada=True)
        )
        print(f"[OK] Tarea actualizada: Columna={updated.columna}, Completada={updated.completada}")
        assert updated.columna == "en_progreso"
        assert updated.completada is True

        # 5. Eliminar la tarea creada
        delete_task(db, db_task=updated)
        print("[OK] Tarea eliminada exitosamente.")

        print("\n=======================================================")
        print(">>> MODULO DE TAREAS Y KANBAN FUNCIONA AL 100% <<<")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run()
