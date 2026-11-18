import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Checkbox, Input } from '@/shared/ui/Input'
import type { Producto, ProductoStockUpdate } from '../types/producto'

type StockFormProps = {
  producto: Producto
  enviando: boolean
  error: string | null
  onGuardar: (data: ProductoStockUpdate) => Promise<void>
  onCancelar: () => void
}

const validarStock = (v: string) => {
  if (v.trim() === '') return 'Ingresá el stock'
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 ? undefined : 'Debe ser un entero mayor o igual a 0'
}

// PATCH /productos/{id}/stock: solo stock y disponibilidad, sin tocar el resto.
export const StockForm = ({ producto, enviando, error, onGuardar, onCancelar }: StockFormProps) => {
  const form = useForm({
    // Al enviar se validan todos los campos, aunque alguno ya haya fallado antes.
    canSubmitWhenInvalid: true,
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onGuardar({ stock: Number(value.stock), disponible: value.disponible }),
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
      <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value), onSubmit: ({ value }) => validarStock(value) }}>
        {(c) => (
          <Input etiqueta="Unidades en stock" tipo="number" min={0} step="1" autoFocus valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(c) => <Checkbox etiqueta="Disponible para la venta" valor={c.state.value} onChange={c.handleChange} />}
      </form.Field>

      {error && <p className="alerta-error">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" cargando={enviando}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
