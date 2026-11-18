import { api } from '@/shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto'

export const listarProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> => {
  // Axios omite los parámetros undefined: solo viajan los filtros cargados.
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export const crearProducto = async (body: ProductoCreate): Promise<Producto> => {
  const { data } = await api.post<Producto>('/productos', body)
  return data
}

export const actualizarProducto = async (id: number, body: ProductoUpdate): Promise<Producto> => {
  const { data } = await api.put<Producto>(`/productos/${id}`, body)
  return data
}

export const actualizarStock = async (id: number, body: ProductoStockUpdate): Promise<Producto> => {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, body)
  return data
}

export const eliminarProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`)
}
