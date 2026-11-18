import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuarios'

export const USUARIOS_KEY = ['usuarios'] as const

export const useUsuarios = (habilitado = true) =>
  useQuery({ queryKey: USUARIOS_KEY, queryFn: listarUsuarios, enabled: habilitado })

export const useUsuarioMutations = () => {
  const queryClient = useQueryClient()
  const invalidar = () => queryClient.invalidateQueries({ queryKey: USUARIOS_KEY })

  const activar = useMutation({ mutationFn: (id: number) => activarUsuario(id), onSuccess: invalidar })
  const desactivar = useMutation({ mutationFn: (id: number) => desactivarUsuario(id), onSuccess: invalidar })
  return { activar, desactivar }
}
