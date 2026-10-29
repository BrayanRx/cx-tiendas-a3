import { NavLink, Outlet } from 'react-router-dom'
import { getTienda } from '@/data/tiendas'
import { useApp } from '@/lib/store'

const enlaces = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/pedido', label: 'Mi pedido' },
  { to: '/seguimiento', label: 'Seguimiento' },
  { to: '/club', label: 'Club 3A' },
  { to: '/panel', label: 'Panel de tienda' },
]

export default function Layout() {
  const tienda = getTienda(useApp((s) => s.tiendaId))
  const enCarrito = useApp((s) => s.carrito.reduce((n, i) => n + i.cantidad, 0))

  return (
    <div className="flex min-h-svh flex-col">
      <div className="bg-ink px-4 py-1.5 text-center text-xs text-white/80">
        Prototipo académico · Ingeniería de Sistemas de Servicio · no afiliado a ninguna cadena comercial
      </div>
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">3A</span>
            Pide y recoge
          </NavLink>
          <nav className="order-3 flex w-full gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto">
            {enlaces.map((e) => (
              <NavLink
                key={e.to}
                to={e.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 ${isActive ? 'bg-brand-soft font-medium text-brand-dark' : 'text-ink-muted hover:text-ink'}`
                }
              >
                {e.label}
                {e.to === '/pedido' && enCarrito > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand px-1.5 text-xs text-white">{enCarrito}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto text-right text-xs text-ink-muted">
            Tu tienda
            <div className="font-medium text-ink">{tienda?.nombre ?? '—'}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-ink-muted">
        Taller CX · Ingeniería de Sistemas de Servicio · Datos simulados
      </footer>
    </div>
  )
}
