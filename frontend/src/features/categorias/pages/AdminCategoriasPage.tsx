import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError, SkeletonFilas } from '@/shared/components/Estados'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { Button } from '@/shared/ui/Button'
import { Modal, ModalConfirmar } from '@/shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategoriaMutations, useCategorias } from '../hooks/useCategorias'
import type { Categoria, CategoriaCreate } from '../types/categoria'

type Edicion = { modo: 'crear' } | { modo: 'editar'; categoria: Categoria } | null

export const AdminCategoriasPage = () => {
  const { data = [], isPending, isError, error, refetch } = useCategorias()
  const { crear, editar, eliminar } = useCategoriaMutations()
  const [edicion, setEdicion] = useState<Edicion>(null)
  const [aBorrar, setABorrar] = useState<Categoria | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        enableSorting: false,
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-stone-400">—</span>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variante="texto" tamano="sm" onClick={() => setEdicion({ modo: 'editar', categoria: row.original })}>
              Editar
            </Button>
            <Button variante="texto" tamano="sm" className="text-red-600 hover:bg-red-50" onClick={() => setABorrar(row.original)}>
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns: columnas,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const mutacionActiva = edicion?.modo === 'editar' ? editar : crear

  const cerrar = () => {
    setEdicion(null)
    crear.reset()
    editar.reset()
  }

  const guardar = async (datos: CategoriaCreate) => {
    try {
      if (edicion?.modo === 'editar') await editar.mutateAsync({ id: edicion.categoria.id, data: datos })
      else await crear.mutateAsync(datos)
      cerrar()
    } catch {
      // El error queda en la mutación y lo muestra el formulario.
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo-pagina">Categorías</h1>
        <Button onClick={() => setEdicion({ modo: 'crear' })}>+ Nueva categoría</Button>
      </div>
      <p className="text-sm text-stone-500">
        Dar de baja una categoría no oculta sus productos: para sacarlos del catálogo, dalos de baja en Productos.
      </p>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <TablaDatos table={table} textoBusqueda="Buscar categoría…" mensajeVacio="No hay categorías cargadas." />
      )}

      <Modal
        abierto={edicion !== null}
        titulo={edicion?.modo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={cerrar}
      >
        {edicion && (
          <CategoriaForm
            key={edicion.modo === 'editar' ? edicion.categoria.id : 'nueva'}
            inicial={edicion.modo === 'editar' ? edicion.categoria : null}
            enviando={mutacionActiva.isPending}
            error={mutacionActiva.error ? handleApiError(mutacionActiva.error) : null}
            onGuardar={guardar}
            onCancelar={cerrar}
          />
        )}
      </Modal>

      <ModalConfirmar
        abierto={aBorrar !== null}
        titulo="Dar de baja la categoría"
        mensaje={
          <>
            ¿Dar de baja <strong>{aBorrar?.nombre}</strong>? Deja de aparecer en el catálogo, pero su nombre sigue
            reservado.
          </>
        }
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        error={eliminar.error ? handleApiError(eliminar.error) : null}
        onConfirmar={() => aBorrar && eliminar.mutate(aBorrar.id, { onSuccess: () => setABorrar(null) })}
        onCerrar={() => {
          setABorrar(null)
          eliminar.reset()
        }}
      />
    </section>
  )
}
