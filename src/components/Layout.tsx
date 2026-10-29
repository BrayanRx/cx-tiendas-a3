import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getTienda, tiendas } from '@/data/tiendas'
import { useApp } from '@/lib/store'
import Logo from './Logo'

const enlacesCliente = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/pedido', label: 'Mi pedido' },
  { to: '/seguimiento', label: 'Seguimiento' },
  { to: '/club', label: 'Club 3A' },
]
const enlacesAdmin = [{ to: '/panel', label: 'Panel de tienda' }]

export default function Layout() {
  const { tiendaId, setTienda, sesion, cerrarSesion } = useApp()
  const tienda = getTienda(tiendaId)
  const enCarrito = useApp((s) => s.carrito.reduce((n, i) => n + i.cantidad, 0))
  const navigate = useNavigate()

  // Visitante: solo ve el catálogo; los demás módulos aparecen al ingresar como cliente.
  // «Antes y después» es material de presentación, no de cliente: solo aparece en el menú del administrador.
  // La ruta /journey sigue abierta por enlace directo para la demo.
  const enlaces = sesion?.rol === 'admin' ? [...enlacesAdmin, { to: '/journey', label: 'Antes y después' }] : sesion ? enlacesCliente : enlacesCliente.slice(0, 1)

  const salir = () => {
    // Primero salimos de la ruta protegida; si no, el guard nos mandaría a /login.
    navigate('/', { flushSync: true })
    cerrarSesion()
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="bg-accent px-4 py-1.5 text-center text-xs text-white/85">
        Prototipo académico · Ingeniería de Sistemas de Servicio · no afiliado a ninguna cadena comercial
      </div>
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <Logo className="h-9" />
            <span className="hidden text-sm sm:inline">Pide y recoge</span>
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
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right text-xs text-ink-muted">
              {sesion?.rol === 'admin' ? (
                <label>
                  Tienda que administras
                  <select
                    value={tiendaId}
                    onChange={(e) => setTienda(e.target.value)}
                    className="mt-0.5 block w-full rounded-md border border-line bg-surface px-2 py-1 text-sm font-medium text-ink"
                  >
                    {tiendas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <>
                  Tu tienda
                  <div className="font-medium text-ink">{tienda?.nombre ?? '—'}</div>
                </>
              )}
            </div>
            {sesion ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden text-right leading-tight sm:block">
                  <span className="block font-medium">{sesion.nombre}</span>
                  <span className="text-xs text-ink-muted">{sesion.rol === 'admin' ? 'Administrador' : 'Cliente'}</span>
                </span>
                <button type="button" onClick={salir} className="rounded-lg border border-line px-3 py-1.5 hover:border-ink-muted">
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">
                Ingresar
              </Link>
            )}
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
