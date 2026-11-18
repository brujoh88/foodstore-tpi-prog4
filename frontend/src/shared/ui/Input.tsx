import type { ReactNode } from 'react'

// Campos de formulario controlados. Reciben valor, onChange y onBlur de un
// form.Field de TanStack Form y muestran su primer error.

type BaseProps = {
  etiqueta: string
  error?: string
  ayuda?: ReactNode
}

const Etiqueta = ({ etiqueta, error, ayuda, children }: BaseProps & { children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
    {etiqueta}
    {children}
    {error ? (
      <span className="text-xs font-normal text-red-600">{error}</span>
    ) : (
      ayuda && <span className="text-xs font-normal text-stone-500">{ayuda}</span>
    )}
  </label>
)

type InputProps = BaseProps & {
  valor: string
  onChange: (valor: string) => void
  onBlur?: () => void
  tipo?: 'text' | 'email' | 'password' | 'number' | 'url'
  placeholder?: string
  autoFocus?: boolean
  autoComplete?: string
  min?: number
  step?: string
  multilinea?: boolean
}

export const Input = ({
  etiqueta,
  error,
  ayuda,
  valor,
  onChange,
  onBlur,
  tipo = 'text',
  multilinea = false,
  ...resto
}: InputProps) => {
  const clase = `campo ${error ? 'campo-invalido' : ''}`
  return (
    <Etiqueta etiqueta={etiqueta} error={error} ayuda={ayuda}>
      {multilinea ? (
        <textarea
          rows={3}
          className={clase}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          placeholder={resto.placeholder}
        />
      ) : (
        <input
          type={tipo}
          className={clase}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          {...resto}
        />
      )}
    </Etiqueta>
  )
}

type SelectProps = BaseProps & {
  valor: string
  onChange: (valor: string) => void
  onBlur?: () => void
  opciones: { valor: string; texto: string }[]
  textoVacio?: string
}

export const Select = ({ etiqueta, error, ayuda, valor, onChange, onBlur, opciones, textoVacio }: SelectProps) => (
  <Etiqueta etiqueta={etiqueta} error={error} ayuda={ayuda}>
    <select
      className={`campo ${error ? 'campo-invalido' : ''}`}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      aria-invalid={Boolean(error)}
    >
      {textoVacio !== undefined && <option value="">{textoVacio}</option>}
      {opciones.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.texto}
        </option>
      ))}
    </select>
  </Etiqueta>
)

type CheckboxProps = {
  etiqueta: string
  valor: boolean
  onChange: (valor: boolean) => void
}

export const Checkbox = ({ etiqueta, valor, onChange }: CheckboxProps) => (
  <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
    <input
      type="checkbox"
      className="size-4 accent-orange-600"
      checked={valor}
      onChange={(e) => onChange(e.target.checked)}
    />
    {etiqueta}
  </label>
)
