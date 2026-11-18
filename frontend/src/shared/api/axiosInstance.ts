import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

// Cliente HTTP único de la aplicación.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  // El navegador adjunta la cookie HttpOnly en cada petición. El frontend nunca
  // lee ni guarda el token: no tiene cómo, y no lo necesita.
  withCredentials: true,
})

export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

// En estas dos rutas un 401 no significa "sesión vencida": en el login son
// credenciales incorrectas y /auth/me lo resuelve checkSession.
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError<{ detail?: unknown }>) => {
    const url = error.config?.url ?? ''
    const status = error.response?.status
    const esDeAuth = RUTAS_DE_AUTH.some((ruta) => url.endsWith(ruta))

    const sesionVencida = status === 401 && !esDeAuth
    const cuentaDesactivada = status === 400 && error.response?.data?.detail === CUENTA_DESACTIVADA

    if (sesionVencida || cuentaDesactivada) {
      // Sin usuario en el store, ProtectedRoute manda al login.
      useAuthStore.getState().limpiarSesion()
    }
    // Se propaga igual: el componente que hizo la petición decide qué mostrar.
    return Promise.reject(error)
  },
)
