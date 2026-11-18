import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias/types/categoria'
import { Button } from '@/shared/ui/Button'
import { Checkbox, Input, Select } from '@/shared/ui/Input'
import type { Producto, ProductoCreate } from '../types/producto'

type ProductoFormProps = {
  inicial: Producto | null
  categorias: Categoria[]
  enviando: boolean
  error: string | null
  onGuardar: (data: ProductoCreate) => Promise<void>
  onCancelar: () => void
}

// Los números se editan como texto y se convierten al enviar: así el campo puede
// quedar vacío mientras se escribe sin que aparezca un 0 forzado.
type Valores = {
  nombre: string
  descripcion: string
  precio_base: string
  imagen_url: string
  stock: string
  disponible: boolean
  categoria_id: string
}

const validarNombre = (v: string) => (v.trim().length < 2 ? 'Mínimo 2 caracteres' : v.length > 150 ? 'Máximo 150 caracteres' : undefined)
const validarPrecio = (v: string) => {
  if (v.trim() === '') return 'Ingresá un precio'
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? undefined : 'Debe ser un número mayor o igual a 0'
}
const validarStock = (v: string) => {
  if (v.trim() === '') return 'Ingresá el stock'
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 ? undefined : 'Debe ser un entero mayor o igual a 0'
}
const validarCategoria = (v: string) => (v ? undefined : 'Elegí una categoría')
const validarUrl = (v: string) => (v.trim() === '' || /^https?:\/\/\S+$/.test(v.trim()) ? undefined : 'Debe empezar con http:// o https://')

export const ProductoForm = ({ inicial, categorias, enviando, error, onGuardar, onCancelar }: ProductoFormProps) => {
  const form = useForm({
    // Al enviar se validan todos los campos, aunque alguno ya haya fallado antes.
    canSubmitWhenInvalid: true,
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial ? String(inicial.precio_base) : '',
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial ? String(inicial.stock) : '0',
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial ? String(inicial.categoria_id) : '',
    } as Valores,
    onSubmit: ({ value }) =>
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
  })

  const opcionesCategoria = categorias.map((c) => ({ valor: String(c.id), texto: c.nombre }))

  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="sm:col-span-2">
        <form.Field name="nombre" validators={{ onChange: ({ value }) => validarNombre(value), onSubmit: ({ value }) => validarNombre(value) }}>
          {(c) => <Input etiqueta="Nombre" autoFocus valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.isTouched ? c.state.meta.errors[0] : undefined} />}
        </form.Field>
      </div>
      <div className="sm:col-span-2">
        <form.Field name="descripcion">
          {(c) => <Input etiqueta="Descripción" multilinea valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} />}
        </form.Field>
      </div>
      <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarPrecio(value), onSubmit: ({ value }) => validarPrecio(value) }}>
        {(c) => <Input etiqueta="Precio base ($)" tipo="number" min={0} step="0.01" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.isTouched ? c.state.meta.errors[0] : undefined} />}
      </form.Field>
      <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value), onSubmit: ({ value }) => validarStock(value) }}>
        {(c) => <Input etiqueta="Stock" tipo="number" min={0} step="1" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />}
      </form.Field>
      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => validarCategoria(value), onSubmit: ({ value }) => validarCategoria(value) }}>
        {(c) => <Select etiqueta="Categoría" textoVacio="Elegí una categoría" opciones={opcionesCategoria} valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />}
      </form.Field>
      <form.Field name="imagen_url" validators={{ onBlur: ({ value }) => validarUrl(value), onSubmit: ({ value }) => validarUrl(value) }}>
        {(c) => <Input etiqueta="URL de la imagen" tipo="url" placeholder="https://…" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />}
      </form.Field>
      <div className="sm:col-span-2">
        <form.Field name="disponible">
          {(c) => <Checkbox etiqueta="Disponible para la venta" valor={c.state.value} onChange={c.handleChange} />}
        </form.Field>
      </div>

      {error && <p className="alerta-error sm:col-span-2">{error}</p>}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" cargando={enviando}>
          {inicial ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
