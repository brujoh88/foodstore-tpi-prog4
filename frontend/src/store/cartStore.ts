import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ItemCarrito = {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  // Para no dejar sumar más de lo que hay. El control definitivo lo hace el backend.
  stock: number
  imagen_url: string | null
}

type ProductoParaCarrito = Omit<ItemCarrito, 'cantidad'>

type CartState = {
  items: ItemCarrito[]
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

const acotar = (cantidad: number, stock: number) => Math.max(1, Math.min(cantidad, Math.max(stock, 1)))

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.producto_id === producto.producto_id)
          // Un producto aparece una sola vez: si ya estaba, se suma la cantidad
          // (el backend rechaza productos repetidos en el pedido).
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, ...producto, cantidad: acotar(i.cantidad + cantidad, producto.stock) }
                  : i,
              ),
            }
          }
          return { items: [...estado.items, { ...producto, cantidad: acotar(cantidad, producto.stock) }] }
        }),

      quitar: (productoId) =>
        set((estado) => ({ items: estado.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items: estado.items.map((i) =>
            i.producto_id === productoId ? { ...i, cantidad: acotar(cantidad, i.stock) } : i,
          ),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((suma, i) => suma + i.cantidad, 0),
    }),
    {
      name: 'foodstore-carrito',
      storage: createJSONStorage(() => localStorage),
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
)
