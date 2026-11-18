import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/auth/types/auth'
import { tieneRol, useAuthStore } from '@/store/authStore'

type ProtectedRouteProps = {
  // Sin roles alcanza con tener sesión.
  roles?: Rol[]
}

// Ordena la navegación; no protege los datos. Eso lo hace el backend con
// get_current_active_user y require_role: ocultar una pantalla no reemplaza al 403.
export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  // checkSession todavía no confirmó la sesión contra /auth/me: se espera.
  if (cargando) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-20 text-stone-500">
        <span className="size-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        Verificando sesión…
      </div>
    )
  }

  // Sin sesión: al login, recordando adónde se quería ir.
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />

  // Con sesión pero sin el rol.
  if (roles && !tieneRol(usuario, roles)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}
