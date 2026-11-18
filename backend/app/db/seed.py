"""Carga inicial: usuario admin, categorías y productos.

    python -m app.db.seed

Es idempotente: se puede correr varias veces y no duplica nada, porque antes de
crear cada registro lo busca por su clave natural (username o nombre).
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import ROL_ADMIN, Usuario

ADMIN = {
    "username": "admin",
    "password": "Admin1234!",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas a la piedra, enteras"),
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para el final"),
]


def _img(texto: str) -> str:
    return f"https://placehold.co/600x400/f59e0b/ffffff?text={texto.replace(' ', '+')}"


# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, rodajas de tomate y ajo", 11000, 15),
    ("Pizzas", "Pizza Fugazzeta", "Rellena de muzzarella y cebolla", 12500, 10),
    ("Hamburguesas", "Hamburguesa Clásica", "Medallón de carne, lechuga y tomate", 8900, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble medallón, cheddar y panceta", 12900, 12),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1500, 60),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1400, 60),
    ("Bebidas", "Gaseosa 1,5 L", "Cola, lima-limón o naranja", 3200, 40),
    ("Bebidas", "Agua sin gas 500 ml", "Agua mineral", 1500, 50),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 4200, 8),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        creados = {"usuarios": 0, "categorias": 0, "productos": 0}

        if not session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first():
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role=ROL_ADMIN,
                )
            )
            creados["usuarios"] += 1

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
                creados["categorias"] += 1
            categorias[nombre] = categoria

        for cat, nombre, descripcion, precio, stock in PRODUCTOS:
            if session.exec(select(Producto).where(Producto.nombre == nombre)).first():
                continue
            categoria_id = categorias[cat].id
            assert categoria_id is not None
            session.add(
                Producto(
                    categoria_id=categoria_id,
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=_img(nombre),
                    stock=stock,
                )
            )
            creados["productos"] += 1

        # El seed corre fuera de la API, como script: no pasa por ningún Service,
        # así que confirma su propia transacción.
        session.commit()

    print(
        f"Seed listo. Nuevos: {creados['usuarios']} usuario(s), "
        f"{creados['categorias']} categoría(s), {creados['productos']} producto(s). "
        f"Admin: {ADMIN['username']} / {ADMIN['password']}"
    )


if __name__ == "__main__":
    seed()
