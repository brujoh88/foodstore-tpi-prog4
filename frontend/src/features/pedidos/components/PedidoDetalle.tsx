import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { ETIQUETA_PAGO, type Pedido } from '../types/pedido'

type PedidoDetalleProps = { pedido: Pedido; cliente?: string }

export const PedidoDetalle = ({ pedido, cliente }: PedidoDetalleProps) => (
  <div className="flex flex-col gap-4 text-sm">
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
      <dt className="text-stone-500">Estado</dt>
      <dd>
        <BadgeEstado estado={pedido.estado} />
      </dd>
      {cliente && (
        <>
          <dt className="text-stone-500">Cliente</dt>
          <dd>{cliente}</dd>
        </>
      )}
      <dt className="text-stone-500">Creado</dt>
      <dd>{formatearFecha(pedido.created_at)}</dd>
      <dt className="text-stone-500">Última actualización</dt>
      <dd>{formatearFecha(pedido.updated_at)}</dd>
      <dt className="text-stone-500">Entrega</dt>
      <dd>{pedido.direccion_entrega}</dd>
      <dt className="text-stone-500">Pago</dt>
      <dd>{ETIQUETA_PAGO[pedido.forma_pago]}</dd>
      {pedido.notas && (
        <>
          <dt className="text-stone-500">Notas</dt>
          <dd>{pedido.notas}</dd>
        </>
      )}
    </dl>

    <table className="tabla w-full overflow-hidden rounded-lg border border-stone-200">
      <thead className="bg-stone-100 text-stone-700">
        <tr>
          <th>Producto</th>
          <th className="text-right">Cant.</th>
          <th className="text-right">Precio</th>
          <th className="text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {pedido.items.map((linea) => (
          <tr key={linea.producto_id} className="border-t border-stone-100">
            {/* nombre y precio son la copia guardada en la línea, no los del producto hoy */}
            <td>{linea.nombre_producto}</td>
            <td className="text-right">{linea.cantidad}</td>
            <td className="text-right">{formatearPrecio(linea.precio_unitario)}</td>
            <td className="text-right">{formatearPrecio(linea.subtotal)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-stone-200 font-bold">
          <td colSpan={3}>Total</td>
          <td className="text-right">{formatearPrecio(pedido.total)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
)
