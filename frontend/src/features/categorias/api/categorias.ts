import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria'

export const listarCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export const crearCategoria = async (body: CategoriaCreate): Promise<Categoria> => {
  const { data } = await api.post<Categoria>('/categorias', body)
  return data
}

export const actualizarCategoria = async (id: number, body: CategoriaUpdate): Promise<Categoria> => {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, body)
  return data
}

export const eliminarCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`)
}
