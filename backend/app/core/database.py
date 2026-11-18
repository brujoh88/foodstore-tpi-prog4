from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita este permiso para que FastAPI use la conexión desde otro hilo.
_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(settings.database_url, connect_args=_connect_args)


def ahora() -> datetime:
    """Fecha y hora actual en UTC, con zona horaria. La usan created_at y updated_at."""
    return datetime.now(timezone.utc)


def inicio_del_dia_local() -> datetime:
    """Medianoche de hoy en la zona horaria del servidor, con zona horaria.
    Sirve para contar "pedidos de hoy" según el día del negocio, no el de UTC."""
    return datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)


def importar_modelos() -> None:
    """Importar los módulos de modelos registra las tablas en SQLModel.metadata y
    deja resueltas las relaciones entre módulos (Usuario.pedidos, Producto.detalles)."""
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401


def create_all_tables() -> None:
    importar_modelos()
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Una sesión nueva. La abre el Unit of Work y la cierra en su __exit__."""
    return Session(engine)
