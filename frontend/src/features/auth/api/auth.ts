import { api } from '@/shared/api/axiosInstance'
import type { UserCreate, UserPublic } from '../types/auth'

// El login, el logout y /me los hace el authStore: son la sesión, estado del cliente.
export const registrarUsuario = async (data: UserCreate): Promise<UserPublic> => {
  const { data: usuario } = await api.post<UserPublic>('/auth/register', data)
  return usuario
}
