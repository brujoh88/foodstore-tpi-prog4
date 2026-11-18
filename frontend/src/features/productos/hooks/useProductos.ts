import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from '../api/productos'
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate, ProductoUpdate } from '../types/producto'

export const PRODUCTOS_KEY = ['productos'] as const

// La queryKey lleva los filtros: cada combinación de página, búsqueda y categoría
// es una entrada distinta de la caché.
export const useProductos = (filtros: FiltrosProductos) =>
  useQuery({
    queryKey: [...PRODUCTOS_KEY, filtros],
    queryFn: () => listarProductos(filtros),
    // Mientras llega la página nueva se sigue viendo la anterior, sin parpadeo.
    placeholderData: keepPreviousData,
  })

export const useProductoMutations = () => {
  const queryClient = useQueryClient()
  const invalidar = () => queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY })

  const crear = useMutation({
    mutationFn: (data: ProductoCreate) => crearProducto(data),
    onSuccess: invalidar,
  })
  const editar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) => actualizarProducto(id, data),
    onSuccess: invalidar,
  })
  const cambiarStock = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) => actualizarStock(id, data),
    onSuccess: invalidar,
  })
  const eliminar = useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: invalidar,
  })
  return { crear, editar, cambiarStock, eliminar }
}
