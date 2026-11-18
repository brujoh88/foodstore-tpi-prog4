import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

// Instancia única de TanStack Query: la caché del estado del servidor.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Se reintenta una vez solo si no hubo respuesta (red caída). Si el servidor
      // respondió con un error, reintentar va a dar el mismo resultado.
      retry: (intentos, error) => !(isAxiosError(error) && error.response) && intentos < 1,
      refetchOnWindowFocus: false,
    },
  },
})
