from datetime import datetime
from typing import Optional, Sequence

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import ENTREGADO, DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self,
        usuario_id: Optional[int],
        estado: Optional[str],
        skip: int,
        limit: int,
    ) -> tuple[int, Sequence[Pedido]]:
        """Pedidos de un usuario, o de todos si usuario_id es None (admin).
        Devuelve el total para paginar y la página, del más nuevo al más viejo."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        pagina = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return total, pagina

    def count_by_estado(self) -> dict[str, int]:
        """Un solo GROUP BY con func.count para los cuatro estados."""
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_entregados(self) -> float:
        suma = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == ENTREGADO)
        ).one()
        return float(suma)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle
