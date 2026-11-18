from datetime import datetime
from typing import Literal, Optional

from pydantic import field_validator
from sqlmodel import Field, SQLModel

FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """RN-06: forma de pago y dirección se validan acá, antes de llegar al Service."""

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = Field(default=None, max_length=500)

    @field_validator("direccion_entrega", "notas", mode="before")
    @classmethod
    def _limpiar(cls, valor: object) -> object:
        # Sin esto, cinco espacios pasarían como una dirección válida.
        if isinstance(valor, str):
            valor = valor.strip()
        return valor


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str]
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
