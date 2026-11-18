import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { registrarUsuario } from '../api/auth'
import type { UserCreate } from '../types/auth'

// Las mismas reglas que valida UserCreate en el backend.
const validarUsername = (v: string) => {
  const t = v.trim()
  if (!t) return 'Elegí un nombre de usuario'
  if (t.length < 3) return 'Mínimo 3 caracteres'
  if (t.length > 50) return 'Máximo 50 caracteres'
  if (/\s/.test(t)) return 'Sin espacios'
  return undefined
}
const validarNombre = (v: string) => {
  const t = v.trim()
  if (t.length < 2) return 'Ingresá tu nombre completo'
  if (t.length > 100) return 'Máximo 100 caracteres'
  return undefined
}
const validarEmail = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : 'Email inválido')
const validarPassword = (v: string) => {
  if (v.length < 8) return 'Mínimo 8 caracteres'
  if (v.length > 72) return 'Máximo 72 caracteres'
  return undefined
}

export const RegisterPage = () => {
  const navigate = useNavigate()
  const registro = useMutation({
    mutationFn: (data: UserCreate) => registrarUsuario(data),
    onSuccess: (usuario) => navigate('/login', { state: { registrado: usuario.username } }),
  })

  const form = useForm({
    // Al enviar se validan todos los campos, aunque alguno ya haya fallado antes.
    canSubmitWhenInvalid: true,
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: ({ value }) =>
      registro.mutateAsync({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      }).catch(() => undefined),
  })

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-5 p-8">
      <div>
        <h1 className="titulo-pagina">Crear cuenta</h1>
        <p className="text-sm text-stone-500">Registrate para hacer pedidos.</p>
      </div>

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onBlur: ({ value }) => validarUsername(value), onSubmit: ({ value }) => validarUsername(value) }}>
          {(c) => (
            <Input etiqueta="Usuario" autoFocus autoComplete="username" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />
          )}
        </form.Field>
        <form.Field name="full_name" validators={{ onBlur: ({ value }) => validarNombre(value), onSubmit: ({ value }) => validarNombre(value) }}>
          {(c) => (
            <Input etiqueta="Nombre completo" autoComplete="name" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />
          )}
        </form.Field>
        <form.Field name="email" validators={{ onBlur: ({ value }) => validarEmail(value), onSubmit: ({ value }) => validarEmail(value) }}>
          {(c) => (
            <Input etiqueta="Email" tipo="email" autoComplete="email" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onBlur: ({ value }) => validarPassword(value), onSubmit: ({ value }) => validarPassword(value) }}>
          {(c) => (
            <Input etiqueta="Contraseña" tipo="password" autoComplete="new-password" ayuda="Mínimo 8 caracteres" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />
          )}
        </form.Field>
        <form.Field
          name="confirmar"
          validators={{
            onChangeListenTo: ['password'],
            onBlur: ({ value, fieldApi }) => (value === fieldApi.form.getFieldValue('password') ? undefined : 'Las contraseñas no coinciden'),
            onSubmit: ({ value, fieldApi }) => (value === fieldApi.form.getFieldValue('password') ? undefined : 'Las contraseñas no coinciden'),
          }}
        >
          {(c) => (
            <Input etiqueta="Repetir contraseña" tipo="password" autoComplete="new-password" valor={c.state.value} onChange={c.handleChange} onBlur={c.handleBlur} error={c.state.meta.errors[0]} />
          )}
        </form.Field>

        {registro.error && (
          <p role="alert" className="alerta-error">
            {handleApiError(registro.error)}
          </p>
        )}

        <Button type="submit" cargando={registro.isPending}>
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="enlace">
          Ingresá
        </Link>
      </p>
    </Card>
  )
}
