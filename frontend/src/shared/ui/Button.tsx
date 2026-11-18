import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'texto'
type Tamano = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700',
  secundario: 'bg-stone-100 text-stone-800 hover:bg-stone-200',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  texto: 'text-orange-700 hover:bg-orange-50',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-4 py-2',
}

export const Button = ({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...resto
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || cargando}
    className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
    {...resto}
  >
    {cargando && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
    {children}
  </button>
)
