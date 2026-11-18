from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Expone también las categorías: al crear o mover un producto hay que
    comprobar que la categoría exista y esté activa, en la misma transacción."""

    productos: ProductoRepository
    categorias: CategoriaRepository

    def _crear_repositorios(self) -> None:
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
