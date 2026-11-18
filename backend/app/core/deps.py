"""Dependencias de sesión y rol. La cadena de un endpoint protegido es:

    cookie -> get_current_user -> get_current_active_user -> require_role

401: sin sesión válida · 400: cuenta desactivada · 403: el rol no alcanza.
"""

from typing import Annotated, Callable

from fastapi import Depends, HTTPException, Request, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_SESION = "access_token"
CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(request: Request) -> UserPublic:
    """Lee el JWT de la cookie HttpOnly, valida firma y expiración y carga el usuario.

    El token solo se acepta desde la cookie: el frontend nunca lo ve, así que
    tampoco podría mandarlo en un encabezado Authorization.
    """
    invalido = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "No autenticado o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.cookies.get(COOKIE_SESION)
    if not token:
        raise invalido
    usuario_id = decode_access_token(token)
    if usuario_id is None:
        raise invalido
    usuario = UsuarioService(UsuarioUnitOfWork()).get_publico(usuario_id)
    if usuario is None:
        raise invalido
    return usuario


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    def verificar(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permisos para esta acción")
        return usuario

    return verificar


UsuarioActivo = Annotated[UserPublic, Depends(get_current_active_user)]
