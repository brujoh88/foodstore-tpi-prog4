import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PRODUCTOS_KEY } from '@/features/productos/hooks/useProductos'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumen,
} from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from '../types/pedido'

export const PEDIDOS_KEY = ['pedidos'] as const
export const RESUMEN_KEY = ['pedidos', 'resumen'] as const

// Crear o cancelar un pedido mueve stock: además de los pedidos, se invalidan los
// productos para que el catálogo muestre el stock nuevo.
const useInvalidarTrasPedido = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: PEDIDOS_KEY }),
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_KEY }),
    ])
}

export const usePedidos = (filtros: FiltrosPedidos) =>
  useQuery({
    queryKey: [...PEDIDOS_KEY, 'lista', filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })

export const useResumenPedidos = () => useQuery({ queryKey: RESUMEN_KEY, queryFn: obtenerResumen })

export const useCrearPedido = () => {
  const invalidar = useInvalidarTrasPedido()
  return useMutation({ mutationFn: (data: PedidoCreate) => crearPedido(data), onSuccess: invalidar })
}

export const useCambiarEstadoPedido = () => {
  const invalidar = useInvalidarTrasPedido()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  })
}

export const useCancelarPedido = () => {
  const invalidar = useInvalidarTrasPedido()
  return useMutation({ mutationFn: (id: number) => cancelarPedido(id), onSuccess: invalidar })
}
