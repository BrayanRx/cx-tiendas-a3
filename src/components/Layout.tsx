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
  // «Antes y después» es material de presentación: vive en el pie de página, visible para todos los roles.
  const enlaces = sesion?.rol === 'admin' ? enlacesAdmin : sesion ? enlacesCliente : enlacesCliente.slice(0, 1)

  const salir = () => {
    // Primero salimos de la ruta protegida; si no, el guard nos mandaría a /login.
    navigate('/', { flushSync: true })
    cerrarSesion()
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="bg-accent px-4 py-1.5 text-xs text-white/85">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-0.5 sm:justify-between">
          <p className="hidden font-semibold text-white sm:block">Barato en precio, barato en tiempo</p>
          <p className="text-center">Prototipo académico · no afiliado a ninguna cadena comercial</p>
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <Logo className="h-9" />
            <span className="hidden text-sm font-bold sm:inline">Pide y recoge</span>
          </NavLink>
          <nav className="order-3 -mx-4 flex w-[calc(100%+2rem)] gap-1 overflow-x-auto px-4 text-sm sm:order-none sm:mx-0 sm:w-auto sm:px-0">
            {enlaces.map((e) => (
              <NavLink
                key={e.to}
                to={e.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium ${isActive ? 'bg-brand-soft text-brand-dark' : 'text-ink-muted hover:text-ink'}`
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
                    className="mt-0.5 block w-full rounded-full border border-line bg-surface px-2.5 py-1 text-sm font-medium text-ink"
                  >
                    {tiendas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <Link to="/#ubicanos" className="block hover:text-ink">
                  Tu tienda
                  <span className="block font-semibold text-ink">{tienda?.nombre ?? '—'}</span>
                </Link>
              )}
            </div>
            {sesion ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden text-right leading-tight sm:block">
                  <span className="block font-semibold">{sesion.nombre}</span>
                  <span className="text-xs text-ink-muted">{sesion.rol === 'admin' ? 'Administrador' : 'Cliente'}</span>
                </span>
                <button type="button" onClick={salir} className="rounded-full border border-line px-3.5 py-1.5 font-medium hover:border-ink-muted">
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="mt-10 bg-accent-dark text-white/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo className="h-9" />
            <p>Tu canasta básica al precio de siempre, sin hacer cola. Pide desde tu celular y recoge en minutos.</p>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Compra</h2>
            <ul className="space-y-2">
              <li><Link to="/catalogo" className="hover:text-white">Catálogo con stock</Link></li>
              <li><Link to="/#canastas" className="hover:text-white">Canastas armadas</Link></li>
              <li><Link to="/club" className="hover:text-white">Club 3A</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Tu tienda</h2>
            <p className="font-semibold text-white">{tienda?.nombre}</p>
            <p>{tienda?.direccion}</p>
            <p>{tienda?.distrito} · {tienda?.horario}</p>
            <Link to="/#ubicanos" className="mt-2 inline-block font-semibold text-white hover:underline">
              Cambiar tienda
            </Link>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">El proyecto</h2>
            <ul className="space-y-2">
              <li><Link to="/journey" className="hover:text-white">Antes y después (customer journey)</Link></li>
              <li><Link to="/#del-dolor" className="hover:text-white">Del dolor a la solución</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 px-4 py-4 text-center text-xs">
          Taller CX · Ingeniería de Sistemas de Servicio · Datos simulados
        </div>
      </footer>
    </div>
  )
}
