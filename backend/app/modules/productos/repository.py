from typing import Optional, Sequence

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self,
        skip: int,
        limit: int,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, Sequence[Producto]]:
        """Productos activos con filtros. Devuelve el total (para paginar) y la página."""
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            # ilike: sin distinguir mayúsculas, en PostgreSQL y en SQLite.
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        pagina = self.session.exec(
            select(Producto).where(*filtros).order_by(Producto.nombre).offset(skip).limit(limit)
        ).all()
        return total, pagina

    def get_para_actualizar(self, producto_id: int) -> Optional[Producto]:
        """Lee el producto bloqueando su fila hasta el commit (SELECT ... FOR UPDATE).

        Si dos clientes compran el último ítem a la vez, el segundo espera a que
        termine la transacción del primero y ve el stock ya descontado. En SQLite
        el bloqueo no existe y la cláusula se ignora.
        """
        consulta = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(consulta).first()
