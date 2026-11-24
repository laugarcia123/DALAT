from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import Usuario
from crud.user import get_user_by_id
from core.security import decode_access_token


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependencia de seguridad que extrae y valida el usuario activo
    a partir del Bearer Token JWT en el encabezado Authorization.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación faltante o con formato incorrecto. Usa 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = int(payload.get("sub"))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identificador de usuario inválido en el token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(db, user_id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El usuario no existe o se encuentra inactivo.",
        )
    return user


def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[Usuario]:
    """Retorna el usuario si el token es válido, o None si no se suministró."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            return get_user_by_id(db, user_id=int(payload.get("sub")))
    except Exception:
        pass
    return None


def get_effective_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Retorna estrictamente el usuario autenticado por Bearer Token.
    Si no hay token o es inválido, rechaza con 401 para garantizar
    la privacidad y segregación estricta de datos entre cuentas.
    """
    user = get_optional_user(authorization=authorization, db=db)
    if user:
        return user
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión no válida o expirada. Por favor inicia sesión.",
        headers={"WWW-Authenticate": "Bearer"},
    )
