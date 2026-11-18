import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError, SkeletonFilas } from '@/shared/components/Estados'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { formatearPrecio } from '@/shared/utils/formato'
import { Badge } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Modal, ModalConfirmar } from '@/shared/ui/Modal'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useProductoMutations, useProductos } from '../hooks/useProductos'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto'

type Accion =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'borrar'; producto: Producto }
  | null

export const AdminProductosPage = () => {
  // El panel trae hasta 100 productos y pagina del lado del cliente con TanStack Table.
  const { data, isPending, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const { crear, editar, cambiarStock, eliminar } = useProductoMutations()
  const [accion, setAccion] = useState<Accion>(null)
  const [busqueda, setBusqueda] = useState('')

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria.nombre },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ getValue }) => formatearPrecio(getValue<number>()),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ getValue }) => {
          const stock = getValue<number>()
          return stock === 0 ? <Badge color="rojo">Sin stock</Badge> : stock
        },
      },
      {
        accessorKey: 'disponible',
        header: 'Venta',
        cell: ({ getValue }) =>
          getValue<boolean>() ? <Badge color="verde">Disponible</Badge> : <Badge color="gris">Pausado</Badge>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1 whitespace-nowrap">
            <Button variante="texto" tamano="sm" onClick={() => setAccion({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button variante="texto" tamano="sm" onClick={() => setAccion({ tipo: 'editar', producto: row.original })}>
              Editar
            </Button>
            <Button
              variante="texto"
              tamano="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setAccion({ tipo: 'borrar', producto: row.original })}
            >
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns: columnas,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const cerrar = () => {
    setAccion(null)
    crear.reset()
    editar.reset()
    cambiarStock.reset()
    eliminar.reset()
  }

  const guardarProducto = async (datos: ProductoCreate) => {
    try {
      if (accion?.tipo === 'editar') await editar.mutateAsync({ id: accion.producto.id, data: datos })
      else await crear.mutateAsync(datos)
      cerrar()
    } catch {
      // El formulario muestra el error de la mutación.
    }
  }

  const guardarStock = async (datos: ProductoStockUpdate) => {
    if (accion?.tipo !== 'stock') return
    try {
      await cambiarStock.mutateAsync({ id: accion.producto.id, data: datos })
      cerrar()
    } catch {
      // Ídem.
    }
  }

  const mutacionForm = accion?.tipo === 'editar' ? editar : crear

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo-pagina">Productos</h1>
        <Button onClick={() => setAccion({ tipo: 'crear' })} disabled={!categorias.data?.length}>
          + Nuevo producto
        </Button>
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <TablaDatos table={table} textoBusqueda="Buscar producto o categoría…" mensajeVacio="No hay productos cargados." />
      )}

      <Modal
        abierto={accion?.tipo === 'crear' || accion?.tipo === 'editar'}
        titulo={accion?.tipo === 'editar' ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={cerrar}
        ancho="lg"
      >
        {(accion?.tipo === 'crear' || accion?.tipo === 'editar') && (
          <ProductoForm
            key={accion.tipo === 'editar' ? accion.producto.id : 'nuevo'}
            inicial={accion.tipo === 'editar' ? accion.producto : null}
            categorias={categorias.data ?? []}
            enviando={mutacionForm.isPending}
            error={mutacionForm.error ? handleApiError(mutacionForm.error) : null}
            onGuardar={guardarProducto}
            onCancelar={cerrar}
          />
        )}
      </Modal>

      <Modal abierto={accion?.tipo === 'stock'} titulo={`Stock · ${accion?.tipo === 'stock' ? accion.producto.nombre : ''}`} onCerrar={cerrar}>
        {accion?.tipo === 'stock' && (
          <StockForm
            key={accion.producto.id}
            producto={accion.producto}
            enviando={cambiarStock.isPending}
            error={cambiarStock.error ? handleApiError(cambiarStock.error) : null}
            onGuardar={guardarStock}
            onCancelar={cerrar}
          />
        )}
      </Modal>

      <ModalConfirmar
        abierto={accion?.tipo === 'borrar'}
        titulo="Dar de baja el producto"
        mensaje={
          <>
            ¿Dar de baja <strong>{accion?.tipo === 'borrar' ? accion.producto.nombre : ''}</strong>? Sale del catálogo;
            los pedidos que ya lo incluyen no cambian.
          </>
        }
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        error={eliminar.error ? handleApiError(eliminar.error) : null}
        onConfirmar={() => accion?.tipo === 'borrar' && eliminar.mutate(accion.producto.id, { onSuccess: cerrar })}
        onCerrar={cerrar}
      />
    </section>
  )
}
