from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # Único aunque la categoría esté dada de baja: la baja no libera el nombre.
    nombre: str = Field(unique=True, index=True, max_length=100)
    descripcion: Optional[str] = None
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
