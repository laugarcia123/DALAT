from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
import models.user         # Registra Usuario en Base.metadata
import models.subject      # Registra Asignatura y Evaluacion en Base.metadata
import models.task         # Registra Tarea en Base.metadata
import models.schedule     # Registra HorarioClase en Base.metadata
import models.repository   # Registra EquipoEstudio y DocumentoRepositorio en Base.metadata
import models.study_session # Registra SesionEstudio en Base.metadata
from routers.user import router as user_router
from routers.subject import router as subject_router
from routers.ai import router as ai_router
from routers.task import router as task_router
from routers.schedule import router as schedule_router
from routers.repository import router as repository_router
from routers.study_session import router as study_session_router

# Inicialización de la aplicación FastAPI
app = FastAPI(
    title="Dalat Backend API",
    description="API RESTful para el Asistente de Estudio Inteligente Dalat (Gestión de Usuarios, Tareas, Asignaturas, Notas y Recursos IA)",
    version="1.0.0",
)

import os

# Configuración de CORS para permitir la comunicación con el frontend de Next.js (Local y Vercel)
frontend_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]
env_frontend = os.getenv("FRONTEND_URL")
if env_frontend:
    frontend_origins.append(env_frontend.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.dalat\.app|http://localhost:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creación automática de tablas si la base de datos está conectada
try:
    Base.metadata.create_all(bind=engine)
    print("[BD] Tablas de Base de Datos verificadas / creadas con exito.")
except Exception as e:
    print(f"[BD] Aviso al inicializar tablas: {e}")

# Registro de routers bajo el prefijo /api
app.include_router(user_router, prefix="/api")
app.include_router(subject_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(task_router, prefix="/api")
app.include_router(schedule_router, prefix="/api")
app.include_router(repository_router, prefix="/api")
app.include_router(study_session_router, prefix="/api")


@app.get("/", tags=["Salud"])
def root():
    return {
        "status": "online",
        "app": "Dalat Study Assistant API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }
