import { useState } from 'react'
import { formatearPrecio } from '@/shared/utils/formato'
import { Badge } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { useCartStore } from '@/store/cartStore'
import type { Producto } from '../types/producto'

type ProductoCardProps = { producto: Producto }

export const ProductoCard = ({ producto }: ProductoCardProps) => {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [recienAgregado, setRecienAgregado] = useState(false)

  const sinStock = producto.stock === 0
  const sePuedeAgregar = producto.disponible && !sinStock && enCarrito < producto.stock

  const alAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock: producto.stock,
      imagen_url: producto.imagen_url,
    })
    setRecienAgregado(true)
    window.setTimeout(() => setRecienAgregado(false), 1200)
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-40 bg-orange-50">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="flex size-full items-center justify-center text-5xl" aria-hidden="true">
            🍽️
          </span>
        )}
        <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-stone-700">
          {producto.categoria.nombre}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-extrabold text-stone-900">{formatearPrecio(producto.precio_base)}</span>
          {!producto.disponible ? (
            <Badge color="gris">No disponible</Badge>
          ) : sinStock ? (
            <Badge color="rojo">Sin stock</Badge>
          ) : (
            <span className="text-xs text-stone-500">Stock: {producto.stock}</span>
          )}
        </div>

        <Button onClick={alAgregar} disabled={!sePuedeAgregar} variante={recienAgregado ? 'secundario' : 'primario'}>
          {recienAgregado ? '✓ Agregado' : enCarrito >= producto.stock && !sinStock ? 'Máximo en el carrito' : 'Agregar al carrito'}
        </Button>
      </div>
    </article>
  )
}
