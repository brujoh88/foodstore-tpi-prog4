// Mismos nombres de campo que los schemas del backend (app/modules/usuarios/schemas.py).

export type Rol = 'admin' | 'user'

export interface UserPublic {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MensajeResponse {
  message: string
}

// Lo que guarda el authStore: lo justo para la Navbar y los permisos de la interfaz.
export interface UsuarioSesion {
  id: number
  username: string
  nombre: string
  email: string
  rol: Rol
}
