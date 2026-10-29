import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import NotFound from '@/components/NotFound'
import CatalogoPage from '@/features/catalogo/CatalogoPage'
import ClubPage from '@/features/club/ClubPage'
import HomePage from '@/features/home/HomePage'
import PanelPage from '@/features/panel/PanelPage'
import PedidoPage from '@/features/pedido/PedidoPage'
import SeguimientoPage from '@/features/seguimiento/SeguimientoPage'

// Cada ruta pertenece a un módulo (ver EQUIPO.md). Solo el líder edita este archivo.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogoPage />} />
        <Route path="pedido" element={<PedidoPage />} />
        <Route path="seguimiento" element={<SeguimientoPage />} />
        <Route path="seguimiento/:id" element={<SeguimientoPage />} />
        <Route path="club" element={<ClubPage />} />
        <Route path="panel" element={<PanelPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
