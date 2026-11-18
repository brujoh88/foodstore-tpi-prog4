from typing import Optional

from app.core.database import ahora, inicio_del_dia_local
from app.modules.pedidos.models import (
    CANCELADO,
    EN_PREPARACION,
    ENTREGADO,
    PENDIENTE,
    DetallePedido,
    Pedido,
)
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ROL_ADMIN
from app.modules.usuarios.schemas import UserPublic

# RN-02: la máquina de estados. Toda transición se valida contra este mapa antes
# de tocar el pedido. Los estados terminales no tienen salida.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


# --- Excepciones de dominio. El router las traduce a códigos HTTP. ---


class PedidoNoEncontrado(Exception):  # 404
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"El pedido {pedido_id} no existe")


class PedidoAjeno(Exception):  # 403
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoNoEncontrado(Exception):  # 404
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} no existe o fue dado de baja")


class ReglaDeNegocio(Exception):  # 400: base de las reglas que rechazan la operación
    pass


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self) -> None:
        super().__init__("Un producto no puede repetirse en el pedido: sumá la cantidad en un solo ítem")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"'{nombre}' no está disponible por el momento")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {stock} y se pidieron {pedido}")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


class CancelacionNoPermitida(ReglaDeNegocio):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE (este está {estado})")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ------------------------------------------------------------------ RN-01
    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        """Crea el pedido completo o no crea nada.

        Si cualquier ítem falla (no existe, no está disponible, no hay stock), la
        excepción sale del bloque with y el __exit__ del Unit of Work hace rollback:
        se deshacen el INSERT del pedido, las líneas ya creadas y los descuentos de
        stock de los ítems anteriores.
        """
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas or None,
                    total=0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_para_actualizar(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                # Verificar, descontar y crear la línea en la misma iteración.
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------------------------------------------------------------- lectura
    def listar(
        self, usuario: UserPublic, estado: Optional[str], skip: int, limit: int
    ) -> PedidosPaginados:
        # RN-04: el admin ve todos; el cliente, solo los suyos.
        filtro_usuario = None if usuario.role == ROL_ADMIN else usuario.id
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(filtro_usuario, estado, skip, limit)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if usuario.role != ROL_ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------- RN-02 y RN-03
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """El admin avanza o cancela según el mapa de transiciones."""
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(pedido.estado, nuevo_estado)
            if nuevo_estado == CANCELADO:
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------- RN-03 y RN-04
    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """El cliente cancela un pedido propio, y solo si está PENDIENTE."""
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise CancelacionNoPermitida(pedido.estado)
            self._restituir_stock(uow, pedido)
            pedido.estado = CANCELADO
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------------------------------------------------------------- resumen
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia_local()),
                ingresos_entregados=round(uow.pedidos.sum_total_entregados(), 2),
            )

    # --------------------------------------------------------------- privados
    @staticmethod
    def _buscar(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """Devuelve al stock lo de cada línea, en la misma transacción que cambia
        el estado: si algo falla, no queda un pedido cancelado sin su stock."""
        for linea in pedido.items:
            producto = uow.productos.get_para_actualizar(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
                uow.productos.add(producto)
