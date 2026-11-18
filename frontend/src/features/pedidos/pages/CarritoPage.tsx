import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/Estados'
import { formatearPrecio } from '@/shared/utils/formato'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useCartStore } from '@/store/cartStore'

export const CarritoPage = () => {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Sumá productos desde el catálogo."
        accion={
          <Link to="/" className="enlace">
            Ver el menú
          </Link>
        }
      />
    )
  }

  const botonCantidad =
    'size-8 cursor-pointer rounded-lg bg-stone-100 font-bold text-stone-700 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="titulo-pagina">Tu carrito</h1>
          <Button variante="texto" tamano="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </div>

        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.producto_id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-orange-50">
                  {item.imagen_url && <img src={item.imagen_url} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-40 flex-1">
                  <p className="font-semibold text-stone-900">{item.nombre}</p>
                  <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
                </div>
                <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.nombre}`}>
                  <button
                    type="button"
                    className={botonCantidad}
                    disabled={item.cantidad <= 1}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    aria-label="Restar uno"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                  <button
                    type="button"
                    className={botonCantidad}
                    disabled={item.cantidad >= item.stock}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    aria-label="Sumar uno"
                  >
                    +
                  </button>
                </div>
                <p className="w-28 text-right font-bold text-stone-900">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </p>
                <Button variante="texto" tamano="sm" onClick={() => quitar(item.producto_id)}>
                  Quitar
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <Card className="flex h-fit flex-col gap-4 lg:sticky lg:top-24">
        <h2 className="font-bold text-stone-900">Resumen</h2>
        <dl className="flex flex-col gap-1 text-sm">
          {items.map((i) => (
            <div key={i.producto_id} className="flex justify-between text-stone-600">
              <dt>
                {i.cantidad} × {i.nombre}
              </dt>
              <dd>{formatearPrecio(i.precio_unitario * i.cantidad)}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-extrabold">
          <span>Total</span>
          <span>{formatearPrecio(total())}</span>
        </div>
        <Button onClick={() => navigate('/checkout')}>Confirmar pedido</Button>
        <Link to="/" className="text-center text-sm enlace">
          Seguir comprando
        </Link>
      </Card>
    </section>
  )
}
