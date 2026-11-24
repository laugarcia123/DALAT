from datetime import datetime, timedelta, timezone
from db.database import SessionLocal
from core.security import hash_password
from models import Usuario, TipoPlan

def seed_users():
    db = SessionLocal()
    
    # Limpiar usuarios anteriores de prueba si existían
    old_emails = [
        "camilo.gratis@dalat.app",
        "valentina.anual@dalat.app",
        "andres.institucional@uniandes.edu.co",
        "mateo.micro@dalat.app"
    ]
    for old_email in old_emails:
        db.query(Usuario).filter(Usuario.email == old_email).delete()
    db.commit()

    now = datetime.now(timezone.utc)

    users_data = [
        {
            "nombre": "Daniel Granados",
            "email": "danielgaber@gmail.com",
            "password": "123456hola",
            "tipo_plan": TipoPlan.PRO,
            "tokens_disponibles": 150,
            "fecha_fin_suscripcion": now + timedelta(days=365),
            "carrera": "Ingeniería de Sistemas",
            "universidad": "Universidad Nacional",
            "semestre": "6to Semestre",
            "es_institucional": False,
            "avatar_color": "#7c5dfa",
            "biografia": "Estudiante de ingeniería enfocado en desarrollo y productividad académica.",
        },
        {
            "nombre": "Camilo Torres",
            "email": "camilo.torres@gmail.com",
            "password": "password123",
            "tipo_plan": TipoPlan.BASICO,
            "tokens_disponibles": 10,
            "fecha_fin_suscripcion": None,
            "carrera": None,
            "universidad": None,          # Sin universidad asignada (plan normal particular)
            "semestre": None,
            "es_institucional": False,
            "avatar_color": "#6366f1",
            "biografia": "Estudiante en capa gratuita.",
        },
        {
            "nombre": "Valentina Morales",
            "email": "valentina.morales@gmail.com",
            "password": "password123",
            "tipo_plan": TipoPlan.PRO,
            "tokens_disponibles": 150,
            "fecha_fin_suscripcion": now + timedelta(days=365),
            "carrera": None,
            "universidad": None,          # Sin universidad asignada (plan anual particular)
            "semestre": None,
            "es_institucional": False,
            "avatar_color": "#a855f7",
            "biografia": "Suscriptora del Plan Anual Pro.",
        },
        {
            "nombre": "Andrés Gómez",
            "email": "andres.gomez@gmail.com",
            "password": "password123",
            "tipo_plan": TipoPlan.INSTITUCIONAL,
            "tokens_disponibles": 500,
            "fecha_fin_suscripcion": now + timedelta(days=180),
            "carrera": "Ingeniería",
            "universidad": "Universidad de los Andes",  # Identificador de la institución que pagó el convenio
            "semestre": "5to Semestre",
            "es_institucional": True,     # Flag institucional activo
            "avatar_color": "#10b981",
            "biografia": "Cuenta corporativa vinculada al convenio institucional de su universidad.",
        },
        {
            "nombre": "Mateo Silva",
            "email": "mateo.silva@gmail.com",
            "password": "password123",
            "tipo_plan": TipoPlan.MICRO,
            "tokens_disponibles": 40,
            "fecha_fin_suscripcion": now + timedelta(days=7),
            "carrera": None,
            "universidad": None,          # Sin universidad asignada (microsuscripción particular)
            "semestre": None,
            "es_institucional": False,
            "avatar_color": "#f59e0b",
            "biografia": "Estudiante con microsuscripción activa (Pase Sprint de 1 semana).",
        },
    ]

    print("\n[SEED] Registrando los 4 usuarios con correos @gmail y configuración precisa...")

    for u in users_data:
        existing = db.query(Usuario).filter(Usuario.email == u["email"]).first()
        if existing:
            existing.nombre = u["nombre"]
            existing.password_hash = hash_password(u["password"])
            existing.tipo_plan = u["tipo_plan"]
            existing.tokens_disponibles = u["tokens_disponibles"]
            existing.fecha_fin_suscripcion = u["fecha_fin_suscripcion"]
            existing.carrera = u["carrera"]
            existing.universidad = u["universidad"]
            existing.semestre = u["semestre"]
            existing.es_institucional = u["es_institucional"]
            existing.avatar_color = u["avatar_color"]
            existing.biografia = u["biografia"]
            print(f" -> Usuario actualizado: {u['nombre']} ({u['email']}) | Plan: {u['tipo_plan'].value} | Univ: {u['universidad']}")
        else:
            new_user = Usuario(
                nombre=u["nombre"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                tipo_plan=u["tipo_plan"],
                tokens_disponibles=u["tokens_disponibles"],
                fecha_fin_suscripcion=u["fecha_fin_suscripcion"],
                carrera=u["carrera"],
                universidad=u["universidad"],
                semestre=u["semestre"],
                es_institucional=u["es_institucional"],
                avatar_color=u["avatar_color"],
                biografia=u["biografia"],
                is_active=True,
            )
            db.add(new_user)
            print(f" -> Usuario CREADO: {u['nombre']} ({u['email']}) | Plan: {u['tipo_plan'].value} | Univ: {u['universidad']}")

    db.commit()

    total = db.query(Usuario).count()
    print(f"\n[OK] Base de datos sincronizada. Total de usuarios activos en dalat_db: {total}")
    db.close()

if __name__ == "__main__":
    seed_users()
