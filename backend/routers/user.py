from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
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
    Verifica credenciales y retorna el JWT con el perfil del usuario.
    """
    user = authenticate_user(db, email=login_in.email, password=login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    # Si se autenticó como estudiante de institución y proporcionó la universidad, la actualizamos
    if login_in.institucion and login_in.institucion.strip():
        user.universidad = login_in.institucion.strip()
        user.es_institucional = True
        db.commit()
        db.refresh(user)

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


@router.get("/", response_model=List[UserResponse])
def list_all_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Listado paginado de usuarios (para administración interna)."""
    return get_users(db, skip=skip, limit=limit)
