import { useState } from 'react'
import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { useApp } from '@/lib/store'
import { cupones, formasDeGanar, niveles, type Cupon } from './cupones'
import NpsForm from './NpsForm'

// Responsable: Rafael Chu-lau · rama feat/club
// Lee: puntos, pedidos, encuestas (useApp)
// Escribe: canjearPuntos, registrarNps
interface CuponCanjeado {
  cupon: Cupon
  codigo: string
}

const fecha = (t: number) => new Date(t).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })

export default function ClubPage() {
  const { puntos, pedidos, canjearPuntos } = useApp()
  // Los cupones canjeados son estado local de esta pantalla (los puntos sí se descuentan en el store).
  const [canjeados, setCanjeados] = useState<CuponCanjeado[]>([])
  const [aviso, setAviso] = useState('')

  const ganados = pedidos.filter((p) => p.estado !== 'cancelado')
  // Los 120 puntos iniciales son el bono de bienvenida del store.
  const acumulados = 120 + ganados.reduce((s, p) => s + p.puntosGanados, 0)
  const nivel = [...niveles].reverse().find((n) => acumulados >= n.desde) ?? niveles[0]
  const siguiente = niveles[niveles.indexOf(nivel) + 1]
  const progreso = siguiente ? Math.min(100, ((acumulados - nivel.desde) / (siguiente.desde - nivel.desde)) * 100) : 100

  const canjear = (c: Cupon) => {
    if (!canjearPuntos(c.costo)) {
      setAviso('No tienes puntos suficientes para este cupón.')
      return
    }
    const codigo = 'CLUB-' + Math.random().toString(36).slice(2, 7).toUpperCase()
    setCanjeados((prev) => [{ cupon: c, codigo }, ...prev])
    setAviso(`¡Listo! Canjeaste «${c.titulo}». Muestra el código ${codigo} en el mostrador.`)
  }

  return (
    <div className="space-y-8">
      <PageHeader titulo="Club 3A" descripcion="Tus compras suman puntos que puedes canjear por cupones en marca propia." />

      <section aria-label="Tu saldo" className="grid gap-4 md:grid-cols-2">
        <Card className="bg-brand-soft">
          <p className="text-sm text-ink-muted">Tu saldo</p>
          <p className="mt-1 text-4xl font-semibold text-brand-dark">
            {puntos} <span className="text-lg font-medium">puntos</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">Cada cupón de marca propia cuesta entre 60 y 200 puntos.</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">Tu nivel</p>
            <Badge tono="brand">{nivel.nombre}</Badge>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-canvas"
            role="progressbar"
            aria-valuenow={Math.round(progreso)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso al siguiente nivel"
          >
            <div className="h-full bg-brand" style={{ width: `${progreso}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            {siguiente ? `Te faltan ${siguiente.desde - acumulados} puntos acumulados para ${siguiente.nombre}.` : 'Alcanzaste el nivel máximo.'}
          </p>
          <p className="mt-1 text-sm">{nivel.beneficio}</p>
        </Card>
      </section>

      <section aria-labelledby="h-cupones">
        <h2 id="h-cupones" className="mb-3 text-xl font-semibold">
          Cupones de marca propia
        </h2>
        {aviso && (
          <p role="status" className="mb-3 rounded-lg bg-brand-soft p-3 text-sm text-brand-dark">
            {aviso}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cupones.map((c) => (
            <Card key={c.id} className="flex flex-col gap-1">
              <div className="text-3xl" aria-hidden>
                {c.imagen}
              </div>
              <p className="mt-1 font-medium">{c.titulo}</p>
              <p className="text-sm text-ink-muted">{c.detalle}</p>
              <div className="mb-3">
                <Badge>{c.marca}</Badge>
              </div>
              <Button className="mt-auto" disabled={puntos < c.costo} onClick={() => canjear(c)}>
                Canjear · {c.costo} pts
              </Button>
            </Card>
          ))}
        </div>

        {canjeados.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">Tus cupones canjeados</h3>
            <ul className="space-y-2">
              {canjeados.map((x) => (
                <li key={x.codigo} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface p-3 text-sm">
                  <span>
                    {x.cupon.imagen} {x.cupon.titulo} · {x.cupon.detalle}
                  </span>
                  <Badge tono="ok">{x.codigo}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="h-historial">
        <h2 id="h-historial" className="mb-3 text-xl font-semibold">
          Historial de puntos
        </h2>
        <Card className="p-0">
          <ul className="divide-y divide-line">
            {ganados.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <span>
                  Pedido {p.id} · S/ {p.total.toFixed(2)} <span className="text-ink-muted">· {fecha(p.creadoEn)}</span>
                </span>
                <Badge tono="ok">+{p.puntosGanados} pts</Badge>
              </li>
            ))}
            <li className="flex items-center justify-between p-4 text-sm">
              <span>Bono de bienvenida</span>
              <Badge tono="ok">+120 pts</Badge>
            </li>
            {ganados.length === 0 && (
              <li className="p-4 text-sm text-ink-muted">Aún no tienes pedidos. Haz tu primer «Pide y recoge» para sumar puntos.</li>
            )}
          </ul>
        </Card>
      </section>

      <section aria-labelledby="h-ganar">
        <h2 id="h-ganar" className="mb-3 text-xl font-semibold">
          Cómo ganar puntos
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {formasDeGanar.map((f) => (
            <Card key={f.titulo}>
              <div className="text-3xl" aria-hidden>
                {f.imagen}
              </div>
              <p className="mt-2 font-medium">{f.titulo}</p>
              <p className="text-sm text-ink-muted">{f.detalle}</p>
            </Card>
          ))}
        </div>
      </section>

      <NpsForm />
    </div>
  )
}
