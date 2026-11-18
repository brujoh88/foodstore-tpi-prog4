from typing import Optional, Sequence

from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca sin distinguir mayúsculas e incluye las dadas de baja: el nombre
        sigue ocupado después de la baja."""
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(consulta).first()

    def listar_activas(self) -> Sequence[Categoria]:
        consulta = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return self.session.exec(consulta).all()
