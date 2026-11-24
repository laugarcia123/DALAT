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
import models.repository
from schemas.repository import EquipoCreate, DocumentoCreate
from schemas.user import UserCreate
from crud.user import create_user, get_user_by_email
from crud.repository import (
    get_user_equipos,
    get_equipo_by_id,
    create_equipo,
    delete_equipo,
    get_equipo_documentos,
    create_documento,
    delete_documento,
    seed_default_repository_for_user,
)


def run():
    print("[TEST REPOSITORIO] Inicializando tablas...")
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

        # 1. Sembrado o consulta de equipos
        equipos = get_user_equipos(db, user_id=user.id_usuario)
        if len(equipos) == 0:
            equipos = seed_default_repository_for_user(db, user_id=user.id_usuario)
        print(f"[OK] Total equipos/espacios: {len(equipos)}")
        assert len(equipos) >= 4, "Debe haber al menos 4 equipos/espacios sembrados"

        # 2. Consultar documentos del primer equipo
        primer_equipo = equipos[0]
        docs = get_equipo_documentos(db, equipo_id=primer_equipo.id_equipo, user_id=user.id_usuario)
        print(f"[OK] Documentos en '{primer_equipo.nombre}': {len(docs)}")
        assert len(docs) >= 1, "El equipo debe tener al menos un documento"

        # 3. Crear nuevo equipo
        print("\n--- Crear Nuevo Equipo de Estudio ---")
        nuevo_eq = create_equipo(
            db,
            EquipoCreate(
                nombre="Club de Algoritmos Avanzados",
                materia="Estructura de Datos",
                icono_iniciales="CA",
                color="#6366f1",
                miembros_count=5,
            ),
            user_id=user.id_usuario,
        )
        print(f"[OK] Equipo creado: ID {nuevo_eq.id_equipo}, Código Invitación: {nuevo_eq.codigo_invitacion}")
        assert nuevo_eq.id_equipo is not None

        # 4. Agregar documento al nuevo equipo
        print("\n--- Agregar Documento al Equipo ---")
        doc_nuevo = create_documento(
            db,
            DocumentoCreate(
                id_equipo=nuevo_eq.id_equipo,
                nombre="CheatSheet de Complejidad Temporal Big-O.pdf",
                formato="PDF",
                tamano="1.1 MB",
                autor_nombre="Andrea Gómez",
                descripcion="Resumen de algoritmos de ordenamiento y grafos",
            ),
            user_id=user.id_usuario,
        )
        print(f"[OK] Documento creado: ID {doc_nuevo.id_documento}, Nombre: '{doc_nuevo.nombre}'")
        assert doc_nuevo.id_documento is not None

        # 5. Eliminar documento
        eliminado = delete_documento(db, doc_id=doc_nuevo.id_documento, user_id=user.id_usuario)
        assert eliminado is True
        print("[OK] Documento eliminado correctamente.")

        # 6. Eliminar equipo
        delete_equipo(db, db_equipo=nuevo_eq)
        verif = get_equipo_by_id(db, equipo_id=nuevo_eq.id_equipo, user_id=user.id_usuario)
        assert verif is None
        print("[OK] Equipo eliminado correctamente con borrado en cascada.")

        print("\n=======================================================")
        print(">>> MODULO DE REPOSITORIO ACADEMICO AL 100% <<<")
        print("=======================================================")

    finally:
        db.close()


if __name__ == "__main__":
    run()
