from typing import Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel


def _limpiar(valor: object) -> object:
    return valor.strip() if isinstance(valor, str) else valor


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)

    _strip = field_validator("nombre", "descripcion", mode="before")(_limpiar)


class CategoriaUpdate(SQLModel):
    """Actualización parcial: solo cambia lo que se envía."""

    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)

    _strip = field_validator("nombre", "descripcion", mode="before")(_limpiar)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    activo: bool
