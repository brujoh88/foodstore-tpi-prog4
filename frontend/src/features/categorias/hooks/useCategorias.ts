import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from '../api/categorias'
import type { CategoriaCreate, CategoriaUpdate } from '../types/categoria'

export const CATEGORIAS_KEY = ['categorias'] as const

export const useCategorias = () =>
  useQuery({ queryKey: CATEGORIAS_KEY, queryFn: listarCategorias, staleTime: 5 * 60_000 })

export const useCategoriaMutations = () => {
  const queryClient = useQueryClient()
  // Un cambio de categoría puede cambiar lo que muestran los productos (su categoría embebida).
  const invalidar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY }),
      queryClient.invalidateQueries({ queryKey: ['productos'] }),
    ])

  const crear = useMutation({
    mutationFn: (data: CategoriaCreate) => crearCategoria(data),
    onSuccess: invalidar,
  })
  const editar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) => actualizarCategoria(id, data),
    onSuccess: invalidar,
  })
  const eliminar = useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: invalidar,
  })
  return { crear, editar, eliminar }
}
