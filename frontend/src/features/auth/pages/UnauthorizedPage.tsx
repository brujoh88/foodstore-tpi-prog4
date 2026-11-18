import { Link } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/Estados'

export const UnauthorizedPage = () => (
  <EstadoVacio
    titulo="No tenés permiso para ver esta página"
    mensaje="Tu usuario no tiene el rol necesario."
    accion={
      <Link to="/" className="enlace">
        Volver al catálogo
      </Link>
    }
  />
)
