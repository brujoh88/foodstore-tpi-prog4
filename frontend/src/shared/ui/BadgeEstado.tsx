import { ETIQUETA_ESTADO, type EstadoPedido } from '@/features/pedidos/types/pedido'

const COLORES: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-sky-100 text-sky-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-stone-200 text-stone-600',
}

export const BadgeEstado = ({ estado }: { estado: EstadoPedido }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${COLORES[estado]}`}>
    {ETIQUETA_ESTADO[estado]}
  </span>
)

type BadgeProps = { color: 'verde' | 'gris' | 'rojo' | 'ambar'; children: string }

const COLORES_BADGE: Record<BadgeProps['color'], string> = {
  verde: 'bg-green-100 text-green-800',
  gris: 'bg-stone-200 text-stone-600',
  rojo: 'bg-red-100 text-red-700',
  ambar: 'bg-amber-100 text-amber-800',
}

export const Badge = ({ color, children }: BadgeProps) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${COLORES_BADGE[color]}`}>
    {children}
  </span>
)
