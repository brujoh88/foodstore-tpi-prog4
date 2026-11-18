import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { api } from '@/shared/api/axiosInstance'
import type { MensajeResponse, Rol, UserPublic, UsuarioSesion } from '@/features/auth/types/auth'

type AuthState = {
  usuario: UsuarioSesion | null
  // true desde que arranca la app hasta que /auth/me confirma (o no) la sesión
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

const pedirPerfil = async (): Promise<UsuarioSesion> => {
  const { data } = await api.get<UserPublic>('/auth/me')
  return { id: data.id, username: data.username, nombre: data.full_name, email: data.email, rol: data.role }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        // OAuth2 pide un formulario (x-www-form-urlencoded), no JSON. La respuesta
        // trae la cookie; los datos del usuario salen de /auth/me.
        await api.post<MensajeResponse>('/auth/token', new URLSearchParams({ username, password }))
        set({ usuario: await pedirPerfil(), cargando: false })
      },

      logout: async () => {
        try {
          await api.post<MensajeResponse>('/auth/logout')
        } finally {
          // Aunque la API no responda, la sesión se cierra en la pantalla.
          set({ usuario: null, cargando: false })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          set({ usuario: await pedirPerfil(), cargando: false })
        } catch {
          // 401 (sin cookie o vencida), 400 (cuenta desactivada) o sin red.
          set({ usuario: null, cargando: false })
        }
      },

      limpiarSesion: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => localStorage),
      // Solo los datos del usuario, para pintar la Navbar al recargar. Nunca el token:
      // ese vive en la cookie HttpOnly y JavaScript no lo puede leer.
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
)

export const tieneRol = (usuario: UsuarioSesion | null, roles: Rol[]): boolean =>
  usuario !== null && roles.includes(usuario.rol)
