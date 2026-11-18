from sqlmodel import SQLModel


class Mensaje(SQLModel):
    """Respuesta del login y del logout. El token nunca va en el cuerpo: viaja en la cookie."""

    message: str
