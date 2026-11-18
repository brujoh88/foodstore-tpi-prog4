import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import type { Categoria, CategoriaCreate } from '../types/categoria'

type CategoriaFormProps = {
  inicial: Categoria | null
  enviando: boolean
  error: string | null
  onGuardar: (data: CategoriaCreate) => Promise<void>
  onCancelar: () => void
}

const validarNombre = (v: string) => {
  const t = v.trim()
  if (t.length < 2) return 'Mínimo 2 caracteres'
  if (t.length > 100) return 'Máximo 100 caracteres'
  return undefined
}
const validarDescripcion = (v: string) => (v.length > 500 ? 'Máximo 500 caracteres' : undefined)

export const CategoriaForm = ({ inicial, enviando, error, onGuardar, onCancelar }: CategoriaFormProps) => {
  const form = useForm({
    // Al enviar se validan todos los campos, aunque alguno ya haya fallado antes.
    canSubmitWhenInvalid: true,
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: ({ value }) =>
      onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="nombre" validators={{ onChange: ({ value }) => validarNombre(value), onSubmit: ({ value }) => validarNombre(value) }}>
        {(c) => (
          <Input etiqueta="Nombre" autoFocus valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.isTouched ? c.state.meta.errors[0] : undefined} />
        )}
      </form.Field>
      <form.Field name="descripcion" validators={{ onChange: ({ value }) => validarDescripcion(value) }}>
        {(c) => (
          <Input etiqueta="Descripción" multilinea valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />
        )}
      </form.Field>

      {error && <p className="alerta-error">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" cargando={enviando}>
          {inicial ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}
