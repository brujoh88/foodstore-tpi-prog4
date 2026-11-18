import { isAxiosError } from 'axios'

type ErrorValidacion = { msg: string; loc?: (string | number)[] }

// FastAPI responde los errores en `detail`: un texto (400, 401, 403, 404, 409) o una
// lista de errores de validación (422).
export const handleApiError = (error: unknown): string => {
  if (!isAxiosError(error)) return 'Ocurrió un error inesperado'
  if (!error.response) return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'

  const detail: unknown = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return (detail as ErrorValidacion[])
      .map((d) => {
        const campo = d.loc?.at(-1)
        return campo ? `${String(campo)}: ${d.msg}` : d.msg
      })
      .join(' · ')
  }
  return `Error ${error.response.status} del servidor`
}
