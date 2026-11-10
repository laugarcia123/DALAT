import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuracion de base de datos
# Por defecto intenta conectar a PostgreSQL con el driver psycopg2
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:admin123@localhost:5432/dalat_db"
)

# Correccion de dialecto para psycopg2 en SQLAlchemy 2.0+
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        pass
    print("Conectado exitosamente a PostgreSQL:", DATABASE_URL.split("@")[-1])
except Exception as e:
    # Fallback automatico a SQLite local para permitir desarrollo sin bloquear
    SQLITE_URL = "sqlite:///./dalat.db"
    print(f"[BD] PostgreSQL no disponible localmente. Usando SQLite para desarrollo: {SQLITE_URL}")
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

Base = declarative_base()
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
