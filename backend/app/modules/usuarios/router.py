from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.models import ROL_ADMIN
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])

Admin = Annotated[UserPublic, Depends(require_role([ROL_ADMIN]))]


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


Service = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: Admin, service: Service) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _: Admin, service: Service) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: Admin, service: Service) -> UserPublic:
    return service.desactivar(usuario_id, admin_id=admin.id)
