import { NavLink, Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const MainLayout = () => (
  <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <Outlet />
    </main>
    <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-400">
      Food Store · TPI Programación 4 · Tiseira Gustavo Hernán
    </footer>
  </div>
)

const SECCIONES_ADMIN = [
  { a: '/admin/resumen', texto: 'Resumen' },
  { a: '/admin/pedidos', texto: 'Pedidos' },
  { a: '/admin/productos', texto: 'Productos' },
  { a: '/admin/categorias', texto: 'Categorías' },
  { a: '/admin/usuarios', texto: 'Usuarios' },
]

// Pestañas del panel de administración, sobre todas sus pantallas.
export const AdminLayout = () => (
  <div className="flex flex-col gap-6">
    <nav className="flex flex-wrap gap-1 border-b border-stone-200" aria-label="Panel de administración">
      {SECCIONES_ADMIN.map((s) => (
        <NavLink
          key={s.a}
          to={s.a}
          className={({ isActive }) =>
            `-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              isActive ? 'border-orange-600 text-orange-700' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`
          }
        >
          {s.texto}
        </NavLink>
      ))}
    </nav>
    <Outlet />
  </div>
)
