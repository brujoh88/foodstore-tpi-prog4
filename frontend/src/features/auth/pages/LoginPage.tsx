import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'

type EstadoNavegacion = { desde?: string; registrado?: string } | null

const obligatorio = (valor: string, campo: string) => (valor.trim() ? undefined : `Ingresá ${campo}`)

export const LoginPage = () => {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const state = useLocation().state as EstadoNavegacion
  const [error, setError] = useState<string | null>(null)

  const destino = state?.desde ?? '/'

  const form = useForm({
    // Al enviar se validan todos los campos, aunque alguno ya haya fallado antes.
    canSubmitWhenInvalid: true,
    defaultValues: { username: state?.registrado ?? '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  // Si ya hay sesión confirmada, el login no tiene sentido.
  if (usuario && !cargando) return <Navigate to={destino} replace />

  return (
    <Card className="mx-auto flex max-w-md flex-col gap-5 p-8">
      <div>
        <h1 className="titulo-pagina">Iniciar sesión</h1>
        <p className="text-sm text-stone-500">Entrá para confirmar tu pedido y seguirlo.</p>
      </div>

      {state?.registrado && <p className="alerta-ok">Tu cuenta quedó creada. Ya podés ingresar.</p>}

      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onBlur: ({ value }) => obligatorio(value, 'tu usuario'), onSubmit: ({ value }) => obligatorio(value, 'tu usuario') }}>
          {(campo) => (
            <Input
              etiqueta="Usuario"
              autoFocus
              autoComplete="username"
              valor={campo.state.value}
              onChange={campo.handleChange}
              onBlur={campo.handleBlur}
              error={campo.state.meta.errors[0]}
            />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onBlur: ({ value }) => obligatorio(value, 'tu contraseña'), onSubmit: ({ value }) => obligatorio(value, 'tu contraseña') }}>
          {(campo) => (
            <Input
              etiqueta="Contraseña"
              tipo="password"
              autoComplete="current-password"
              valor={campo.state.value}
              onChange={campo.handleChange}
              onBlur={campo.handleBlur}
              error={campo.state.meta.errors[0]}
            />
          )}
        </form.Field>

        {error && (
          <p role="alert" className="alerta-error">
            {error}
          </p>
        )}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" cargando={enviando}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-center text-sm text-stone-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="enlace">
          Registrate
        </Link>
      </p>
    </Card>
  )
}
