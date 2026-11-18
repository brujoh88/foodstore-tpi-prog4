import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-orange-100 text-orange-800' : 'text-stone-600 hover:bg-stone-100'
  }`

export const Navbar = () => {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  // El selector devuelve un número: la Navbar solo se redibuja si cambia la cantidad.
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 flex items-center gap-2 text-lg font-extrabold text-orange-600">
          <span aria-hidden="true">🍔</span> Food Store
        </Link>

        <NavLink to="/" end className={claseLink}>
          Catálogo
        </NavLink>
        <NavLink to="/carrito" className={claseLink}>
          Carrito
          {cantidad > 0 && (
            <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs text-white">{cantidad}</span>
          )}
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={claseLink}>
            Mis pedidos
          </NavLink>
        )}
        {/* El panel se oculta a quien no es admin. La protección real está en el backend. */}
        {usuario?.rol === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => claseLink({ isActive }) + ' sm:ml-1'}>
            Panel admin
          </NavLink>
        )}

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="hidden text-right text-sm leading-tight sm:block">
                <span className="block font-semibold text-stone-800">{usuario.nombre}</span>
                <span className="block text-xs text-stone-500">
                  {usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </span>
              <button
                type="button"
                onClick={cerrarSesion}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <Link
                to="/register"
                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
