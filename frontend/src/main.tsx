import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { queryClient } from '@/shared/api/queryClient'
import { useAuthStore } from '@/store/authStore'
import './index.css'

// Si cambia el usuario (logout, otra cuenta), se vacía la caché: lo que cargó uno
// no lo tiene que ver el siguiente.
useAuthStore.subscribe((estado, anterior) => {
  if (anterior.usuario && estado.usuario?.id !== anterior.usuario.id) queryClient.clear()
})

const raiz = document.getElementById('root')
if (!raiz) throw new Error('Falta el elemento #root en index.html')

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
