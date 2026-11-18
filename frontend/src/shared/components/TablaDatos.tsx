import { flexRender, type Table } from '@tanstack/react-table'
import { Paginacion } from './Paginacion'

type TablaDatosProps<T> = {
  // La instancia la crea la página con useReactTable; este componente solo la dibuja.
  table: Table<T>
  // Sin texto de búsqueda no se muestra el buscador (filtro global del lado del cliente).
  textoBusqueda?: string
  mensajeVacio: string
}

const FLECHAS: Record<string, string> = { asc: ' ↑', desc: ' ↓' }

export const TablaDatos = <T,>({ table, textoBusqueda, mensajeVacio }: TablaDatosProps<T>) => {
  const filas = table.getRowModel().rows
  const busqueda = String(table.getState().globalFilter ?? '')

  return (
    <div className="flex flex-col gap-3">
      {textoBusqueda && (
        <input
          type="search"
          aria-label={textoBusqueda}
          placeholder={textoBusqueda}
          value={busqueda}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="campo max-w-sm"
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="tabla w-full border-collapse text-sm">
          <thead className="bg-stone-100 text-stone-700">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id}>
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="cursor-pointer font-semibold"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {FLECHAS[String(header.column.getIsSorted())] ?? ''}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.id} className="border-t border-stone-100 hover:bg-stone-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id}>{flexRender(celda.column.columnDef.cell, celda.getContext())}</td>
                ))}
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="py-10 text-center text-stone-500">
                  {busqueda ? `Nada coincide con «${busqueda}».` : mensajeVacio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacion
        pagina={table.getState().pagination.pageIndex}
        totalPaginas={table.getPageCount()}
        onCambiar={(p) => table.setPageIndex(p)}
      />
    </div>
  )
}
