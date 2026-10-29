import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { modulos } from '@/config/equipo'
import { tiendas } from '@/data/tiendas'
import { useApp } from '@/lib/store'

const pasos = [
  { n: '1', titulo: 'Elige tu tienda', texto: 'Mira el stock real de la tienda más cercana antes de salir de casa.' },
  { n: '2', titulo: 'Arma tu pedido', texto: 'Canasta básica y marcas propias al mismo precio bajo de siempre.' },
  { n: '3', titulo: 'Recoge sin fila', texto: 'Paga con QR, elige tu horario y retira en el mostrador en minutos.' },
]

export default function HomePage() {
  const tiendaId = useApp((s) => s.tiendaId)
  const setTienda = useApp((s) => s.setTienda)

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Badge tono="brand">Nuevo · Pide y recoge</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Barato en precio.
            <br />
            Barato en tiempo.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">
            Compra tu canasta básica desde el celular y recógela sin hacer cola. Sabes qué hay en stock, pagas con QR y
            ganas puntos en cada pedido.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/catalogo">
              <Button>Empezar mi pedido</Button>
            </Link>
            <a href="#ubicanos">
              <Button variante="secondary">Ubicar mi tienda</Button>
            </a>
          </div>
        </div>
        <Card className="grid gap-4">
          {pasos.map((p) => (
            <div key={p.n} className="flex gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand-dark">
                {p.n}
              </span>
              <div>
                <p className="font-medium">{p.titulo}</p>
                <p className="text-sm text-ink-muted">{p.texto}</p>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section id="ubicanos" className="scroll-mt-24">
        <h2 className="text-xl font-semibold">Ubícanos</h2>
        <p className="mt-1 text-ink-muted">Elige la tienda donde recogerás tu pedido. La espera en caja es la de hoy en hora punta.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiendas.map((t) => {
            const activa = t.id === tiendaId
            return (
              <button
                key={t.id}
                onClick={() => setTienda(t.id)}
                className={`rounded-xl border bg-surface p-4 text-left transition-colors ${activa ? 'border-brand ring-2 ring-brand-soft' : 'border-line hover:border-ink-muted'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{t.nombre}</p>
                  {activa && <Badge tono="brand">Elegida</Badge>}
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {t.direccion} · {t.distrito}
                </p>
                <p className="mt-3 text-xs text-ink-muted">
                  {t.horario} · cola en caja ≈ <span className="font-medium text-warn">{t.esperaCajaMin} min</span>
                </p>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Del dolor a la solución</h2>
        <p className="mt-1 text-ink-muted">Cada parte de esta experiencia responde a un punto de dolor del customer journey.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modulos
            .filter((m) => m.id !== 'base')
            .map((m) => (
              <Link key={m.id} to={m.ruta}>
                <Card className="h-full transition-colors hover:border-ink-muted">
                  <p className="text-sm text-ink-muted">{m.dolor}</p>
                  <p className="mt-3 font-medium text-brand-dark">{m.nombre} →</p>
                  {m.id === 'panel' && (
                    <p className="mt-1 text-xs text-ink-muted">Solo administrador de tienda</p>
                  )}
                </Card>
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}
