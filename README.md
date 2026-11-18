# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN)

**Autor:** Tiseira Gustavo Hernán

| | |
|---|---|
| Repositorio | <https://github.com/brujoh88/foodstore-tpi-prog4> |
| Video de demostración | `PENDIENTE: link público al video` |

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un
carrito y confirman un pedido con dirección de entrega y forma de pago (efectivo o transferencia). El
negocio administra categorías, productos, stock, pedidos y usuarios desde un panel de administración.

- **`backend/`** — API REST con FastAPI + SQLModel sobre PostgreSQL. Arquitectura en capas con Unit of
  Work, autenticación con JWT en cookie HttpOnly y autorización por roles.
- **`frontend/`** — React + TypeScript con Vite y Tailwind CSS. TanStack Query para el estado del
  servidor, Zustand para la sesión y el carrito, TanStack Form y TanStack Table en los formularios y
  tablas, organizado por features.

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel no funciona con 3.14) |
| PostgreSQL | 15 o superior (o Docker para levantarlo con el `docker-compose.yml` incluido) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior |

Para probar sin PostgreSQL, el backend acepta SQLite cambiando `DATABASE_URL` (ver más abajo).

## Instalación y ejecución

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate            # En Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # En Windows: copy .env.example .env
```

Base de datos: con Docker, el `docker-compose.yml` crea una base `foodstore_db` con el usuario y la
contraseña que ya figuran en el `.env.example`:

```bash
docker compose up -d
```

Si el puerto 5432 está ocupado, se puede usar otro (`DB_PORT=5433 docker compose up -d`) y ajustar el
puerto en `DATABASE_URL`. Si ya hay un PostgreSQL instalado, alcanza con crear la base y apuntar
`DATABASE_URL` a ella.

Cargar los datos iniciales y levantar la API:

```bash
python -m app.db.seed               # admin, 5 categorías y 10 productos. Se puede repetir: no duplica
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación interactiva: <http://localhost:8000/docs> y <http://localhost:8000/redoc>

### 2. Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env                # En Windows: copy .env.example .env
pnpm install
pnpm build                          # verifica los tipos (tsc) y compila
pnpm dev
```

- Aplicación: <http://localhost:5173>

## Variables de entorno

### `backend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://foodstore:foodstore@localhost:5432/foodstore_db` · para SQLite: `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Firma del JWT. Mínimo 32 caracteres: si es más corta, la API no arranca | generar con `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (con credenciales) | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si la API se sirve por HTTPS | `false` |

### `frontend/.env`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API, con el prefijo | `http://localhost:8000/api/v1` |

## Usuario administrador del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

Los clientes se crean desde la pantalla de registro (rol `user`).

## Funcionalidades

**Cliente**

- Registro y login (TanStack Form con validación).
- Catálogo paginado en el servidor, con búsqueda por nombre, filtro por categoría, skeleton de carga y
  estado vacío.
- Carrito que persiste al recargar la página.
- Checkout con dirección de entrega, forma de pago y notas.
- «Mis pedidos» con el detalle de cada uno y la cancelación mientras está pendiente.

**Administrador**

- Resumen con tarjetas: pedidos por estado, pedidos del día e ingresos de los entregados.
- ABM de categorías y productos (TanStack Table + TanStack Form), cambio de stock y disponibilidad.
- Gestión de pedidos con filtro por estado y botones según la máquina de estados.
- Gestión de usuarios: activar y desactivar.

## Reglas de negocio

| Regla | Qué garantiza | Dónde vive |
|---|---|---|
| RN-01 Crear pedido | Al menos un ítem y sin productos repetidos; cada producto existe, está activo, disponible y con stock. Por cada ítem se verifica el stock, se descuenta y se crea la línea copiando nombre y precio. Si algo falla, no se guarda nada | `PedidoService.crear` |
| RN-02 Transiciones | `PENDIENTE → EN_PREPARACION / CANCELADO`, `EN_PREPARACION → ENTREGADO / CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales. Una transición inválida responde 400 | mapa `TRANSICIONES` en `pedidos/service.py` |
| RN-03 Cancelar | Restituye el stock de cada línea en la misma transacción que cambia el estado | `PedidoService._restituir_stock` |
| RN-04 Permisos | El cliente ve y cancela solo sus pedidos, y solo en `PENDIENTE`. El admin ve todos y avanza o cancela desde cualquier estado no terminal | `PedidoService.listar / obtener / cancelar` |
| RN-05 Inmutabilidad | Líneas y total fijos desde la creación. No hay endpoint de edición ni de borrado de pedidos | `DetallePedido` guarda la copia de nombre y precio |
| RN-06 Datos del pedido | `forma_pago` es `EFECTIVO` o `TRANSFERENCIA`; `direccion_entrega` tiene entre 5 y 200 caracteres | schema `PedidoCreate` |

## Arquitectura

### Backend

```
backend/
├── app/
│   ├── main.py                  FastAPI, CORS con credenciales, routers bajo /api/v1
│   ├── core/
│   │   ├── config.py            Settings (pydantic-settings, lee .env)
│   │   ├── database.py          engine, create_all_tables, session_factory
│   │   ├── security.py          bcrypt, create_access_token, decode_access_token
│   │   ├── deps.py              get_current_user, get_current_active_user, require_role
│   │   ├── unit_of_work.py      UnitOfWork: commit / rollback / close en __exit__
│   │   └── base_repository.py   BaseRepository[T]: get_by_id, get_all, add, delete
│   ├── modules/
│   │   ├── auth/                router, service, schemas (usa el modelo Usuario)
│   │   ├── usuarios/            models, schemas, repository, unit_of_work, service, router
│   │   ├── categorias/          ídem
│   │   ├── productos/           ídem
│   │   └── pedidos/             ídem; su Unit of Work expone pedidos y productos
│   └── db/seed.py               carga idempotente de admin, categorías y productos
├── requirements.txt             versiones fijadas
├── .env.example
└── docker-compose.yml           PostgreSQL para desarrollo
```

Cada módulo sigue la cadena **Router → Service → Unit of Work → Repository → Model**, y ninguna capa
importa de la de arriba:

- El **Router** valida el cuerpo con los schemas, resuelve sesión y rol con `Depends`, obtiene el
  Service con `Depends(get_<modulo>_service)` y traduce las excepciones de dominio a `HTTPException`.
- El **Service** abre `with self.uow as uow:`, aplica las reglas y devuelve el schema de salida dentro
  del bloque.
- El **Unit of Work** es el único que confirma: hace `commit` en su `__exit__` si no hubo excepción, y
  `rollback` si la hubo. Ningún Service ni Router llama a `session.commit()`.
- Los **Repositories** solo consultan (con `select`), sin reglas de negocio.

Al crear un pedido, la lectura de cada producto usa `SELECT … FOR UPDATE`: si dos clientes compran la
última unidad al mismo tiempo, el segundo espera a que termine la transacción del primero y ve el stock
ya descontado.

### Frontend

```
frontend/src/
├── shared/
│   ├── api/          axiosInstance (withCredentials + interceptor de 401), handleApiError, queryClient
│   ├── ui/           Button, Card, Input, Modal, BadgeEstado
│   ├── components/   Paginacion, TablaDatos, Estados (Skeleton, EstadoVacio, EstadoError)
│   ├── layout/       Navbar, MainLayout, AdminLayout
│   └── utils/        formato de precios y fechas
├── features/         una carpeta por dominio, que espeja los módulos del backend
│   ├── auth/         LoginPage, RegisterPage, UnauthorizedPage
│   ├── categorias/   AdminCategoriasPage, CategoriaForm, useCategorias
│   ├── productos/    CatalogoPage, AdminProductosPage, ProductoCard, ProductoForm, StockForm, useProductos
│   ├── usuarios/     AdminUsuariosPage, useUsuarios
│   └── pedidos/      CarritoPage, CheckoutPage, MisPedidosPage, AdminPedidosPage, AdminResumenPage,
│                     CheckoutForm, PedidoDetalle, TarjetaResumen, usePedidos
│                     (cada feature con sus pages/, components/, hooks/, api/ y types/)
├── store/            authStore y cartStore (Zustand + persist)
├── routes/           AppRouter y ProtectedRoute
├── App.tsx           llama a checkSession al montar
└── main.tsx          QueryClientProvider
```

**Separación del estado.** TanStack Query maneja el estado del servidor: catálogo, pedidos, usuarios y
resumen, con `queryKey` descriptivas e invalidación después de cada mutación. Zustand maneja el estado
del cliente: la sesión (`authStore`) y el carrito (`cartStore`), los dos con `persist`. El `authStore`
guarda solo los datos del usuario, nunca el token: el token viaja en la cookie HttpOnly y JavaScript no
lo puede leer. Ningún componente pide datos con `fetch` dentro de un `useEffect`; la única llamada en
un `useEffect` es `checkSession` al montar la aplicación.

**Rutas protegidas.** `ProtectedRoute` manda a `/login` si no hay sesión y a `/unauthorized` si el rol
no alcanza, y muestra un indicador mientras `checkSession` confirma la sesión. Es solo navegación: la
protección real la hacen `get_current_active_user` y `require_role` en el backend.

## Endpoints

Todos bajo `/api/v1`. El detalle de cada uno (cuerpos, respuestas y errores) está en `/docs`.

| Método | Endpoint | Acceso |
|---|---|---|
| POST | `/auth/register` · `/auth/token` · `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET · POST | `/admin/usuarios` · `/admin/usuarios/{id}/activar` · `/admin/usuarios/{id}/desactivar` | admin |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos` (`skip`, `limit`, `search`, `categoria_id`, `disponible`) · `/productos/{id}` | Público |
| POST · PUT · PATCH · DELETE | `/productos` · `/productos/{id}` · `/productos/{id}/stock` | admin |
| POST · GET | `/pedidos` (`skip`, `limit`, `estado`) | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |
