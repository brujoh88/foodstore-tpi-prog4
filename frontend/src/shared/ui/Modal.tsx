import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

export const Modal = ({ abierto, titulo, onCerrar, children, ancho = 'md' }: ModalProps) => {
  // Escape cierra el modal. Es un efecto de interfaz, no una carga de datos.
  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-stone-900">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="cursor-pointer rounded px-2 text-xl leading-none text-stone-400 hover:text-stone-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

type ConfirmarProps = {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar: string
  cargando?: boolean
  error?: string | null
  onConfirmar: () => void
  onCerrar: () => void
}

// Confirmación para las acciones que no se deshacen fácil (cancelar, dar de baja).
export const ModalConfirmar = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  cargando = false,
  error,
  onConfirmar,
  onCerrar,
}: ConfirmarProps) => (
  <Modal abierto={abierto} titulo={titulo} onCerrar={onCerrar}>
    <div className="flex flex-col gap-4">
      <div className="text-stone-700">{mensaje}</div>
      {error && <p className="alerta-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-stone-100 px-4 py-2 font-semibold text-stone-800 hover:bg-stone-200"
          onClick={onCerrar}
        >
          Volver
        </button>
        <button
          type="button"
          disabled={cargando}
          className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          onClick={onConfirmar}
        >
          {cargando ? 'Procesando…' : textoConfirmar}
        </button>
      </div>
    </div>
  </Modal>
)
