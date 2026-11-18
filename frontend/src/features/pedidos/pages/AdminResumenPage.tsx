import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError, Skeleton } from '@/shared/components/Estados'
import { formatearPrecio } from '@/shared/utils/formato'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

export const AdminResumenPage = () => {
  const { data, isPending, isError, error, refetch } = useResumenPedidos()

  return (
    <section className="flex flex-col gap-4">
      <h1 className="titulo-pagina">Resumen del negocio</h1>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} detalle="Esperan que la cocina los tome" color="ambar" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} color="cielo" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} color="verde" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} color="gris" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} detalle="Creados desde las 0 h" color="naranja" />
          <TarjetaResumen
            titulo="Ingresos entregados"
            valor={formatearPrecio(data.ingresos_entregados)}
            detalle="Suma de los pedidos entregados"
            color="esmeralda"
          />
        </div>
      )}
    </section>
  )
}
