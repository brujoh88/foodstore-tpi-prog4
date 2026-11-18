import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoVacio } from '@/shared/components/Estados'
import { formatearPrecio } from '@/shared/utils/formato'
import { Card } from '@/shared/ui/Card'
import { useCartStore } from '@/store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types/pedido'

export const CheckoutPage = () => {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        mensaje="Tu carrito está vacío."
        accion={
          <Link to="/" className="enlace">
            Ir al menú
          </Link>
        }
      />
    )
  }

  const confirmar = async (datos: { direccion_entrega: string; forma_pago: FormaPago; notas: string | null }) => {
    try {
      // Solo viajan id y cantidad: el precio lo pone el backend (RN-01), así un
      // precio viejo guardado en el carrito no puede colarse en el pedido.
      await crearPedido.mutateAsync({
        ...datos,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      vaciar()
      navigate('/mis-pedidos', { state: { pedidoCreado: true } })
    } catch {
      // El error queda en crearPedido.error y se muestra abajo.
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col gap-4">
        <h1 className="titulo-pagina">Confirmar pedido</h1>
        {crearPedido.error && (
          <div role="alert" className="alerta-error">
            <p className="font-semibold">No se pudo crear el pedido</p>
            <p>{handleApiError(crearPedido.error)}</p>
            <p className="mt-1">
              Revisá el{' '}
              <Link to="/carrito" className="enlace">
                carrito
              </Link>{' '}
              y probá de nuevo.
            </p>
          </div>
        )}
        <CheckoutForm enviando={crearPedido.isPending} onConfirmar={confirmar} />
      </Card>

      <Card className="flex h-fit flex-col gap-3">
        <h2 className="font-bold text-stone-900">Tu pedido</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between text-stone-600">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-extrabold">
          <span>Total estimado</span>
          <span>{formatearPrecio(total())}</span>
        </div>
        <p className="text-xs text-stone-500">El total final lo calcula el sistema con los precios vigentes.</p>
      </Card>
    </section>
  )
}
