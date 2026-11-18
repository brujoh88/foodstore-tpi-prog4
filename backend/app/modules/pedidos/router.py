from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import UsuarioActivo, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ROL_ADMIN
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

Admin = Annotated[UserPublic, Depends(require_role([ROL_ADMIN]))]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


Service = Annotated[PedidoService, Depends(get_pedido_service)]


def _traducir(error: Exception) -> HTTPException:
    """Excepción de dominio -> código HTTP. Un solo lugar para la tabla de errores."""
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(error))
    if isinstance(error, ReglaDeNegocio):
        return HTTPException(status.HTTP_400_BAD_REQUEST, str(error))
    raise error


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: UsuarioActivo, service: Service) -> PedidoRead:
    try:
        return service.crear(usuario.id, data)
    except (ProductoNoEncontrado, ReglaDeNegocio) as e:
        raise _traducir(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: UsuarioActivo,
    service: Service,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Optional[EstadoPedido] = None,
) -> PedidosPaginados:
    return service.listar(usuario, estado, skip, limit)


# Va antes de /{pedido_id}: si no, FastAPI intentaría leer "resumen" como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: Admin, service: Service) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: UsuarioActivo, service: Service) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except (PedidoNoEncontrado, PedidoAjeno) as e:
        raise _traducir(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int, data: CambioEstado, _: Admin, service: Service
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except (PedidoNoEncontrado, ReglaDeNegocio) as e:
        raise _traducir(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: UsuarioActivo, service: Service) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except (PedidoNoEncontrado, PedidoAjeno, ReglaDeNegocio) as e:
        raise _traducir(e)
