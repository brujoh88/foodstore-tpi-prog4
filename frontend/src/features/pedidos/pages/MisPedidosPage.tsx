import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError, EstadoVacio, SkeletonFilas } from '@/shared/components/Estados'
import { Paginacion } from '@/shared/components/Paginacion'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { ModalConfirmar } from '@/shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 5

export const MisPedidosPage = () => {
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const { state } = useLocation() as { state: { pedidoCreado?: boolean } | null }

  const { data, isPending, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const confirmarCancelacion = () => {
    if (!aCancelar) return
    cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })
  }

  return (
    <section className="flex flex-col gap-5">
      <h1 className="titulo-pagina">Mis pedidos</h1>
      {state?.pedidoCreado && pagina === 0 && (
        <p className="alerta-ok">¡Listo! Tu pedido quedó registrado y está pendiente de preparación.</p>
      )}

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="enlace">
              Ver el menú
            </Link>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {data.items.map((pedido) => (
              <li key={pedido.id}>
                <Card className="flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-stone-900">Pedido #{pedido.id}</span>
                    <BadgeEstado estado={pedido.estado} />
                    <span className="text-sm text-stone-500">{formatearFecha(pedido.created_at)}</span>
                    <span className="ml-auto text-lg font-extrabold">{formatearPrecio(pedido.total)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variante="secundario" tamano="sm" onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}>
                      {abierto === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}
                    </Button>
                    {/* RN-04: el cliente solo cancela en PENDIENTE */}
                    {pedido.estado === 'PENDIENTE' && (
                      <Button variante="texto" tamano="sm" className="text-red-600 hover:bg-red-50" onClick={() => setACancelar(pedido)}>
                        Cancelar pedido
                      </Button>
                    )}
                  </div>
                  {abierto === pedido.id && <PedidoDetalle pedido={pedido} />}
                </Card>
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / POR_PAGINA)} onCambiar={setPagina} />
        </>
      )}

      <ModalConfirmar
        abierto={aCancelar !== null}
        titulo={`Cancelar el pedido #${aCancelar?.id ?? ''}`}
        mensaje="El pedido se cancela y no se puede reactivar. ¿Seguimos?"
        textoConfirmar="Sí, cancelar"
        cargando={cancelar.isPending}
        error={cancelar.error ? handleApiError(cancelar.error) : null}
        onConfirmar={confirmarCancelacion}
        onCerrar={() => {
          setACancelar(null)
          cancelar.reset()
        }}
      />
    </section>
  )
}
