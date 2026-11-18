from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.database import ahora

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

ROL_ADMIN = "admin"
ROL_USER = "user"


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default=ROL_USER)
    # Baja lógica: el usuario no se borra, se desactiva.
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
