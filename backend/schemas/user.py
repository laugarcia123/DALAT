from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from models.user import TipoPlan


# Esquema Base con atributos comunes
class UserBase(BaseModel):
    nombre: str
    email: str
    carrera: Optional[str] = None
    universidad: Optional[str] = None
    semestre: Optional[str] = None
    biografia: Optional[str] = None
    avatar_color: Optional[str] = "#7c5dfa"
    tipo_plan: Optional[TipoPlan] = TipoPlan.BASICO
    es_institucional: Optional[bool] = False


# Esquema para Registro de Usuario (Normal)
class UserCreate(UserBase):
    password: str


# Esquema para Inicio de Sesión (Normal o Institucional)
class UserLogin(BaseModel):
    email: str
    password: str
    institucion: Optional[str] = None
    tipo_login: Optional[str] = "normal"


# Esquema para Inicio de Sesión Social (Google, GitHub, Facebook)
class SocialLoginRequest(BaseModel):
    provider: str
    email: Optional[str] = None
    nombre: Optional[str] = None


# Esquema para Actualización de Perfil
class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    carrera: Optional[str] = None
    universidad: Optional[str] = None
    semestre: Optional[str] = None
    biografia: Optional[str] = None
    avatar_color: Optional[str] = None
    tipo_plan: Optional[TipoPlan] = None
    tokens_disponibles: Optional[int] = None
    meta_semanal_horas: Optional[int] = None
    password: Optional[str] = None


# Esquema de Respuesta al Cliente (Oculta la contraseña)
class UserResponse(BaseModel):
    id_usuario: int
    nombre: str
    email: str
    carrera: Optional[str] = None
    universidad: Optional[str] = None
    semestre: Optional[str] = None
    biografia: Optional[str] = None
    avatar_color: Optional[str] = "#7c5dfa"
    tipo_plan: TipoPlan
    es_institucional: bool
    tokens_disponibles: Optional[int] = 10
    meta_semanal_horas: Optional[int] = 40
    is_active: bool
    fecha_fin_suscripcion: Optional[datetime] = None
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True


# Esquema del Token de Autenticación
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
