from typing import List, Optional
import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario, TipoPlan
from schemas.user import UserCreate, UserLogin, UserUpdate, UserResponse, Token
from crud.user import (
    get_user_by_email,
    get_user_by_id,
    get_users,
    create_user,
    update_user,
    authenticate_user,
)
from core.security import create_access_token
from core.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Usuarios & Autenticación"])


class SocialLoginRequest(BaseModel):
    provider: str
    email: Optional[str] = None
    nombre: Optional[str] = None


@router.post("/social-login", response_model=Token)
def social_login_user(payload: SocialLoginRequest, db: Session = Depends(get_db)):
    """
    Inicia sesión rápida o registra automáticamente al usuario que ingresa con Google, GitHub o Facebook.
    """
    prov = payload.provider.lower()
    email = payload.email

    if not email:
        rand_id = uuid.uuid4().hex[:8]
        email = f"{prov}_{rand_id}@estudiante.dalat.app"
        nombre = payload.nombre or f"Estudiante {prov.capitalize()}"
    else:
        nombre = payload.nombre or email.split("@")[0].replace(".", " ").title()

    user = get_user_by_email(db, email=email)
    if not user:
        user = create_user(
            db,
            user_in=UserCreate(
                nombre=nombre,
                email=email,
                password=str(uuid.uuid4()),
                tipo_plan=TipoPlan.BASICO,
                es_institucional=False,
            )
        )

    access_token = create_access_token(data={"sub": str(user.id_usuario), "email": user.email})
    return Token(access_token=access_token, token_type="bearer", user=user)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registro de nuevo usuario estudiante.
    Valida que el correo no esté duplicado y devuelve el token de sesión inmediato.
    """
    existing_user = get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una cuenta registrada con este correo electrónico",
        )
    
    user = create_user(db, user_in=user_in)
    access_token = create_access_token(data={"sub": str(user.id_usuario), "email": user.email})
    return Token(access_token=access_token, user=user)


@router.post("/login", response_model=Token)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Inicio de sesión para usuario normal o estudiante de institución.
    Verifica credenciales y valida la segregación estricta entre cuentas regulares e institucionales.
    """
    user = authenticate_user(db, email=login_in.email, password=login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    # Determinar si el intento de login es institucional
    es_login_institucional = (
        login_in.tipo_login == "institucion" or
        bool(login_in.institucion and login_in.institucion.strip())
    )

    # 1. Si la cuenta es institucional pero intenta iniciar sesión por la pestaña regular
    if user.es_institucional and not es_login_institucional:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta cuenta requiere inicio de sesión institucional. Por favor ingresa desde la pestaña 'Estudiante de Institución'.",
        )

    # 2. Si la cuenta es regular pero intenta iniciar sesión por la pestaña institucional
    if not user.es_institucional and es_login_institucional:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se encontró una cuenta institucional con estos datos. Si tienes una cuenta personal, inicia sesión desde 'Usuario Regular'.",
        )

    # 3. Si es cuenta institucional y login institucional, validar que la universidad coincida
    if user.es_institucional and es_login_institucional:
        inst_seleccionada = (login_in.institucion or "").strip().lower()
        inst_registrada = (user.universidad or "").strip().lower()
        if not inst_seleccionada:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes seleccionar tu institución educativa para continuar.",
            )
        if inst_registrada and inst_seleccionada != inst_registrada:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="La institución educativa seleccionada no coincide con los registros de esta cuenta.",
            )

    access_token = create_access_token(data={"sub": str(user.id_usuario), "email": user.email})
    return Token(access_token=access_token, user=user)


@router.get("/me", response_model=UserResponse)
def read_current_user_profile(current_user: Usuario = Depends(get_current_user)):
    """Obtiene el perfil del usuario autenticado."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza la información académica y biografía del usuario autenticado."""
    return update_user(db, db_user=current_user, user_in=user_update)


class UpgradePlanRequest(BaseModel):
    plan: str
    tokens: Optional[int] = None


@router.post("/upgrade-plan", response_model=UserResponse)
def upgrade_plan_endpoint(
    payload: UpgradePlanRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza y persiste permanentemente el plan del usuario en la base de datos."""
    plan_str = payload.plan.lower()
    if plan_str == "pro":
        current_user.tipo_plan = TipoPlan.PRO
        current_user.tokens_disponibles = payload.tokens if payload.tokens is not None else 150
    elif plan_str == "micro":
        current_user.tipo_plan = TipoPlan.MICRO
        current_user.tokens_disponibles = payload.tokens if payload.tokens is not None else 40
    elif plan_str == "institucional":
        current_user.tipo_plan = TipoPlan.INSTITUCIONAL
        current_user.tokens_disponibles = payload.tokens if payload.tokens is not None else 500
    else:
        current_user.tipo_plan = TipoPlan.BASICO
        current_user.tokens_disponibles = payload.tokens if payload.tokens is not None else 10

    db.commit()
    db.refresh(current_user)
    return current_user


class DeductTokensRequest(BaseModel):
    amount: int


@router.post("/deduct-tokens", response_model=UserResponse)
def deduct_tokens_endpoint(
    payload: DeductTokensRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Descuenta tokens del saldo del usuario y los persiste en PostgreSQL."""
    cost = max(1, payload.amount)
    current_user.tokens_disponibles = max(0, (current_user.tokens_disponibles or 0) - cost)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/", response_model=List[UserResponse])
def list_all_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Listado paginado de usuarios (para administración interna)."""
    return get_users(db, skip=skip, limit=limit)
