from fastapi import HTTPException, status

from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import ROL_USER, Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Registro y login. Usa el modelo Usuario a través del Unit of Work de usuarios."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")
            # El registro público siempre crea un "user": el rol no viene del cliente.
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role=ROL_USER,
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT. El router lo pone en la cookie."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            # Mismo mensaje para usuario inexistente y contraseña mala: no se le
            # dice a un atacante cuál de los dos acertó.
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED,
                    "Usuario o contraseña incorrectos",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
            assert usuario.id is not None
            return create_access_token(usuario.id)
