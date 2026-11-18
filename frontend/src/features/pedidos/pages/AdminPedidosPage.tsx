import { getCoreRowModel, useReactTable, type ColumnDef, type PaginationState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError, SkeletonFilas } from '@/shared/components/Estados'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Modal, ModalConfirmar } from '@/shared/ui/Modal'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ETIQUETA_ESTADO, ETIQUETA_PAGO, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const ESTADOS = Object.keys(ETIQUETA_ESTADO) as EstadoPedido[]

const TEXTO_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: '',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

export const AdminPedidosPage = () => {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  // Paginación del lado del servidor: TanStack Table solo lleva el número de página.
  const [paginacion, setPaginacion] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)

  const { data, isPending, isError, error, refetch, isFetching } = usePedidos({
    skip: paginacion.pageIndex * paginacion.pageSize,
    limit: paginacion.pageSize,
    estado,
  })
  const usuarios = useUsuarios()
  const cambiarEstado = useCambiarEstadoPedido()

  const nombreCliente = useMemo(() => {
    const mapa = new Map(usuarios.data?.map((u) => [u.id, u.username]))
    return (id: number) => mapa.get(id) ?? `Usuario #${id}`
  }, [usuarios.data])

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      { id: 'cliente', header: 'Cliente', cell: ({ row }) => nombreCliente(row.original.usuario_id) },
      { accessorKey: 'created_at', header: 'Fecha', cell: ({ getValue }) => formatearFecha(getValue<string>()) },
      { accessorKey: 'forma_pago', header: 'Pago', cell: ({ row }) => ETIQUETA_PAGO[row.original.forma_pago] },
      { accessorKey: 'total', header: 'Total', cell: ({ getValue }) => formatearPrecio(getValue<number>()) },
      { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          return (
            <div className="flex justify-end gap-1 whitespace-nowrap">
              <Button variante="texto" tamano="sm" onClick={() => setDetalle(pedido)}>
                Ver
              </Button>
              {/* Solo las transiciones válidas desde el estado actual (RN-02) */}
              {TRANSICIONES[pedido.estado].map((siguiente) =>
                siguiente === 'CANCELADO' ? (
                  <Button key={siguiente} variante="texto" tamano="sm" className="text-red-600 hover:bg-red-50" onClick={() => setACancelar(pedido)}>
                    Cancelar
                  </Button>
                ) : (
                  <Button
                    key={siguiente}
                    variante="secundario"
                    tamano="sm"
                    disabled={cambiarEstado.isPending}
                    onClick={() => cambiarEstado.mutate({ id: pedido.id, estado: siguiente })}
                  >
                    {TEXTO_ACCION[siguiente]}
                  </Button>
                ),
              )}
            </div>
          )
        },
      },
    ],
    [nombreCliente, cambiarEstado],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns: columnas,
    manualPagination: true,
    rowCount: data?.total ?? 0,
    state: { pagination: paginacion },
    onPaginationChange: setPaginacion,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  })

  const filtrar = (nuevo: EstadoPedido | undefined) => {
    setEstado(nuevo)
    setPaginacion((p) => ({ ...p, pageIndex: 0 }))
  }

  const chip = (activo: boolean) =>
    `cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold ${
      activo ? 'bg-orange-600 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
    }`

  return (
    <section className="flex flex-col gap-4">
      <h1 className="titulo-pagina">Pedidos</h1>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        <button type="button" className={chip(estado === undefined)} onClick={() => filtrar(undefined)}>
          Todos
        </button>
        {ESTADOS.map((e) => (
          <button key={e} type="button" className={chip(estado === e)} onClick={() => filtrar(e)}>
            {ETIQUETA_ESTADO[e]}
          </button>
        ))}
      </div>

      {cambiarEstado.error && (
        <p role="alert" className="alerta-error">
          {handleApiError(cambiarEstado.error)}
        </p>
      )}

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
          <TablaDatos table={table} mensajeVacio={estado ? `No hay pedidos en estado «${ETIQUETA_ESTADO[estado]}».` : 'Todavía no hay pedidos.'} />
        </div>
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalle(null)} ancho="lg">
        {detalle && <PedidoDetalle pedido={detalle} cliente={nombreCliente(detalle.usuario_id)} />}
      </Modal>

      <ModalConfirmar
        abierto={aCancelar !== null}
        titulo={`Cancelar el pedido #${aCancelar?.id ?? ''}`}
        mensaje="Se cancela el pedido y se devuelve al stock lo que tenía cada línea. No se puede deshacer."
        textoConfirmar="Cancelar pedido"
        cargando={cambiarEstado.isPending}
        onConfirmar={() =>
          aCancelar &&
          cambiarEstado.mutate({ id: aCancelar.id, estado: 'CANCELADO' }, { onSettled: () => setACancelar(null) })
        }
        onCerrar={() => setACancelar(null)}
      />
    </section>
  )
}
