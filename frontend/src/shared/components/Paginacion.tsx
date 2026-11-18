type PaginacionProps = {
  // Página actual, desde 0
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
  total?: number
}

export const Paginacion = ({ pagina, totalPaginas, onCambiar, total }: PaginacionProps) => {
  if (totalPaginas <= 1) return null
  const boton =
    'cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Paginación">
      <button type="button" className={boton} disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </button>
      <span className="text-sm text-stone-600">
        Página {pagina + 1} de {totalPaginas}
        {total !== undefined && <span className="text-stone-400"> · {total} resultados</span>}
      </span>
      <button
        type="button"
        className={boton}
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </button>
    </nav>
  )
}
