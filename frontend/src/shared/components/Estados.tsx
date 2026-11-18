import type { ReactNode } from 'react'

// Estados de carga, vacío y error que reusan todas las listas.

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} aria-hidden="true" />
)

export const SkeletonTarjetas = ({ cantidad = 8 }: { cantidad?: number }) => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Cargando">
    {Array.from({ length: cantidad }, (_, i) => (
      <div key={i} className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
  </div>
)

export const SkeletonFilas = ({ filas = 5 }: { filas?: number }) => (
  <div className="flex flex-col gap-2" role="status" aria-label="Cargando">
    {Array.from({ length: filas }, (_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
)

type EstadoVacioProps = { titulo: string; mensaje?: string; accion?: ReactNode }

export const EstadoVacio = ({ titulo, mensaje, accion }: EstadoVacioProps) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
    <span className="text-4xl" aria-hidden="true">
      🍽️
    </span>
    <p className="font-semibold text-stone-800">{titulo}</p>
    {mensaje && <p className="text-sm text-stone-500">{mensaje}</p>}
    {accion && <div className="mt-2">{accion}</div>}
  </div>
)

type EstadoErrorProps = { mensaje: string; onReintentar?: () => void }

export const EstadoError = ({ mensaje, onReintentar }: EstadoErrorProps) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-xl bg-red-50 px-6 py-10 text-center">
    <p className="font-semibold text-red-800">No se pudieron cargar los datos</p>
    <p className="text-sm text-red-700">{mensaje}</p>
    {onReintentar && (
      <button
        type="button"
        onClick={onReintentar}
        className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100"
      >
        Reintentar
      </button>
    )}
  </div>
)
