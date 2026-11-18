from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_SESION, UsuarioActivo
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


Service = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(data: UserCreate, service: Service) -> UserPublic:
    return service.registrar(data)


@router.post("/token", response_model=Mensaje)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: Service,
) -> Mensaje:
    token = service.login(form.username, form.password)
    # HttpOnly: JavaScript no puede leerla, así que un XSS no se lleva la sesión.
    # SameSite=Lax: el navegador no la manda en POST desde otros sitios (CSRF).
    response.set_cookie(
        key=COOKIE_SESION,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response) -> Mensaje:
    response.delete_cookie(
        key=COOKIE_SESION,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def perfil(usuario: UsuarioActivo) -> UserPublic:
    return usuario
