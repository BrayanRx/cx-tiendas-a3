import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '@/lib/store'
import type { RolSesion } from '@/lib/types'

export const inicioDeRol = (rol: RolSesion) => (rol === 'admin' ? '/panel' : '/catalogo')

// Protege un grupo de rutas según la sesión simulada.
// Sin sesión → /login (recordando a dónde iba). Con otro rol → su propio inicio.
export default function RequireRol({ rol }: { rol: RolSesion }) {
  const sesion = useApp((s) => s.sesion)
  const location = useLocation()

  if (!sesion) return <Navigate to="/login" replace state={{ desde: location.pathname, rol }} />
  if (sesion.rol !== rol) return <Navigate to={inicioDeRol(sesion.rol)} replace />
  return <Outlet />
}
