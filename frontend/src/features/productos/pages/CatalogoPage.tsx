import { useDeferredValue, useState } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError, EstadoVacio, SkeletonTarjetas } from '@/shared/components/Estados'
import { Paginacion } from '@/shared/components/Paginacion'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

export const CatalogoPage = () => {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  // Valor diferido: React prioriza que el campo responda al tipeo y actualiza la
  // consulta después, con el texto ya escrito.
  const busquedaDiferida = useDeferredValue(busqueda.trim())

  const { data, isPending, isError, error, refetch, isFetching } = useProductos({
    // Paginación en el servidor: skip = página × limit
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busquedaDiferida || undefined,
    categoria_id: categoriaId,
  })
  const categorias = useCategorias()

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0

  const elegirCategoria = (id: number | undefined) => {
    setCategoriaId(id)
    setPagina(0)
  }

  const chip = (activo: boolean) =>
    `cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
      activo ? 'bg-orange-600 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
    }`

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="titulo-pagina">Nuestro menú</h1>
        <p className="text-stone-500">Elegí, sumá al carrito y te lo llevamos.</p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="search"
          className="campo max-w-md"
          placeholder="Buscar por nombre…"
          aria-label="Buscar productos"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          <button type="button" className={chip(categoriaId === undefined)} onClick={() => elegirCategoria(undefined)}>
            Todas
          </button>
          {categorias.data?.map((c) => (
            <button key={c.id} type="button" className={chip(categoriaId === c.id)} onClick={() => elegirCategoria(c.id)}>
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <SkeletonTarjetas cantidad={POR_PAGINA} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje={busquedaDiferida || categoriaId ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
        />
      ) : (
        <>
          <div className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? 'opacity-60' : ''}`}>
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} total={data.total} onCambiar={setPagina} />
        </>
      )}
    </section>
  )
}
