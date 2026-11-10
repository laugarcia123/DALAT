from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
import models.user         # Registra Usuario en Base.metadata
import models.subject      # Registra Asignatura y Evaluacion en Base.metadata
import models.ai_resource  # Registra RecursoIA en Base.metadata
from routers.user import router as user_router
from routers.subject import router as subject_router
from routers.ai import router as ai_router

# Inicialización de la aplicación FastAPI
app = FastAPI(
    title="Dalat Backend API",
    description="API RESTful para el Asistente de Estudio Inteligente Dalat (Gestión de Usuarios, Asignaturas, Notas y Recursos IA)",
    version="1.0.0",
)

# Configuración de CORS para permitir la comunicación con el frontend de Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "*"
    ],
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


@app.get("/", tags=["Salud"])
def root():
    return {
        "status": "online",
        "app": "Dalat Study Assistant API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }
