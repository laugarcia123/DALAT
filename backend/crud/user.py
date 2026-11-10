from typing import Optional, List
from sqlalchemy.orm import Session
from models.user import Usuario
from schemas.user import UserCreate, UserUpdate
from core.security import hash_password, verify_password


def get_user_by_id(db: Session, user_id: int) -> Optional[Usuario]:
    """Obtiene un usuario por su ID primario."""
    return db.query(Usuario).filter(Usuario.id_usuario == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[Usuario]:
    """Obtiene un usuario por su correo electrónico."""
    return db.query(Usuario).filter(Usuario.email == email.lower().strip()).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[Usuario]:
    """Lista usuarios paginados."""
    return db.query(Usuario).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate) -> Usuario:
    """Crea un nuevo usuario con la contraseña hasheada."""
    hashed_pwd = hash_password(user_in.password)
    db_user = Usuario(
        nombre=user_in.nombre.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hashed_pwd,
        carrera=user_in.carrera,
        universidad=user_in.universidad,
        semestre=user_in.semestre,
        biografia=user_in.biografia,
        avatar_color=user_in.avatar_color or "#7c5dfa",
        tipo_plan=user_in.tipo_plan,
        es_institucional=user_in.es_institucional,
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, db_user: Usuario, user_in: UserUpdate) -> Usuario:
    """Actualiza los datos del perfil de un usuario."""
    update_data = user_in.model_dump(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        db_user.password_hash = hash_password(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[Usuario]:
    """Verifica credenciales de acceso para login."""
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
