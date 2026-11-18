from typing import Optional

from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Gestión de usuarios por el admin. Como permite la consigna para auth y
    usuarios, lanza HTTPException directamente, al estilo del proyecto de seguridad."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def get_publico(self, usuario_id: int) -> Optional[UserPublic]:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            return UserPublic.model_validate(usuario) if usuario else None

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "No podés desactivar tu propia cuenta")
        return self._cambiar_estado(usuario_id, disabled=True)

    def _cambiar_estado(self, usuario_id: int, disabled: bool) -> UserPublic:
        # Idempotente: si ya estaba en ese estado, responde 200 igual.
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
