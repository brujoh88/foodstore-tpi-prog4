import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Input, Select } from '@/shared/ui/Input'
import { ETIQUETA_PAGO, type FormaPago } from '../types/pedido'

export type DatosEntrega = {
  direccion_entrega: string
  forma_pago: FormaPago | ''
  notas: string
}

type CheckoutFormProps = {
  enviando: boolean
  onConfirmar: (datos: { direccion_entrega: string; forma_pago: FormaPago; notas: string | null }) => Promise<void>
}

// RN-06, del lado del cliente: las mismas reglas que valida PedidoCreate.
const validarDireccion = (v: string) => {
  const t = v.trim()
  if (t.length < 5) return 'La dirección necesita al menos 5 caracteres'
  if (t.length > 200) return 'Máximo 200 caracteres'
  return undefined
}
const validarPago = (v: FormaPago | '') => (v ? undefined : 'Elegí cómo vas a pagar')
const validarNotas = (v: string) => (v.length > 500 ? 'Máximo 500 caracteres' : undefined)

const OPCIONES_PAGO = (Object.keys(ETIQUETA_PAGO) as FormaPago[]).map((valor) => ({
  valor,
  texto: ETIQUETA_PAGO[valor],
}))

export const CheckoutForm = ({ enviando, onConfirmar }: CheckoutFormProps) => {
  const form = useForm({
    // Al enviar se validan todos los campos, aunque alguno ya haya fallado antes.
    canSubmitWhenInvalid: true,
    defaultValues: { direccion_entrega: '', forma_pago: '', notas: '' } as DatosEntrega,
    onSubmit: async ({ value }) => {
      if (!value.forma_pago) return
      await onConfirmar({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
      })
    },
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
      <form.Field
        name="direccion_entrega"
        validators={{ onBlur: ({ value }) => validarDireccion(value), onSubmit: ({ value }) => validarDireccion(value) }}
      >
        {(c) => (
          <Input
            etiqueta="Dirección de entrega"
            placeholder="Calle, número, piso, depto."
            autoComplete="street-address"
            valor={c.state.value}
            onChange={c.handleChange}
            onBlur={c.handleBlur}
            error={c.state.meta.errors[0]}
          />
        )}
      </form.Field>

      <form.Field
        name="forma_pago"
        validators={{ onChange: ({ value }) => validarPago(value), onSubmit: ({ value }) => validarPago(value) }}
      >
        {(c) => (
          <Select
            etiqueta="Forma de pago"
            textoVacio="Elegí una opción"
            opciones={OPCIONES_PAGO}
            valor={c.state.value}
            onChange={(v) => c.handleChange(v as FormaPago | '')}
            onBlur={c.handleBlur}
            error={c.state.meta.errors[0]}
            ayuda="El pago se coordina al recibir el pedido: no hay pago online."
          />
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: ({ value }) => validarNotas(value) }}>
        {(c) => (
          <Input
            etiqueta="Notas (opcional)"
            multilinea
            placeholder="Ej.: sin cebolla, timbre B"
            valor={c.state.value}
            onChange={c.handleChange}
            onBlur={c.handleBlur}
            error={c.state.meta.errors[0]}
          />
        )}
      </form.Field>

      <Button type="submit" cargando={enviando}>
        Confirmar pedido
      </Button>
    </form>
  )
}
