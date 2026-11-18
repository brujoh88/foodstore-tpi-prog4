from typing import Generic, Optional, Sequence, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Acceso genérico a una tabla. Solo consultas: ni reglas de negocio ni HTTP.

    Nunca hace commit. add() usa flush() para mandar el INSERT y obtener el id
    dentro de la transacción abierta; confirmarla le toca al Unit of Work.
    """

    model: type[T]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, record_id: int) -> Optional[T]:
        return self.session.get(self.model, record_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        return self.session.exec(select(self.model).offset(skip).limit(limit)).all()

    def add(self, instance: T) -> T:
        self.session.add(instance)
        self.session.flush()
        self.session.refresh(instance)
        return instance

    def delete(self, instance: T) -> None:
        # Borrado físico. Las entidades del dominio usan baja lógica, así que
        # ningún Service lo llama; queda por completitud del repositorio base.
        self.session.delete(instance)
        self.session.flush()
