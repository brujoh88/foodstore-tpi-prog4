from types import TracebackType
from typing import Callable, Optional, Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Una transacción: o se guarda todo lo que pasó dentro del `with`, o nada.

        with self.uow as uow:
            uow.productos.add(producto)
            uow.pedidos.add(pedido)
        # sin excepción: commit. Con cualquier excepción: rollback.

    Es la única pieza que llama a commit() y rollback(). Cada módulo la hereda y
    crea sus repositorios en _crear_repositorios(), todos sobre la misma sesión.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self._session: Optional[Session] = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("El Unit of Work se usa dentro de un bloque with")
        return self._session

    def _crear_repositorios(self) -> None:
        """Cada Unit of Work de módulo crea acá sus repositorios."""

    def __enter__(self) -> Self:
        self._session = self._factory()
        self._crear_repositorios()
        return self

    def __exit__(
        self,
        exc_type: Optional[type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self._session = None
