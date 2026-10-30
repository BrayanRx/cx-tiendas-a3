import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Badge, Button, Card, SectionHeader } from '@/components/ui'
import { modulos } from '@/config/equipo'
import { canastas, type Canasta } from '@/data/canastas'
import { encuestasDemo } from '@/data/demo'
import { getProducto } from '@/data/productos'
import { getTienda, stock, tiendas } from '@/data/tiendas'
import { formatSoles } from '@/lib/format'
import { totalItems, useApp } from '@/lib/store'

// Responsable: Brayan Rojas · rama feat/base
// Dolor que resuelve: poca presencia digital (el cliente no descubre ni ubica la tienda).
// Lee: tiendaId, carrito, encuestas (useApp), stock (@/data/tiendas), canastas (@/data/canastas)
// Escribe: setTienda, agregarAlCarrito (canastas), cargarDemo y reiniciarDemo (modo demostración)

const pasos = [
  { n: '1', titulo: 'Elige tu tienda', texto: 'Mira el stock real de la tienda más cercana antes de salir de casa.' },
  { n: '2', titulo: 'Arma tu pedido', texto: 'Canasta básica y marcas propias al mismo precio bajo de siempre.' },
  { n: '3', titulo: 'Recoge sin fila', texto: 'Paga con QR, elige tu horario y retira en el mostrador en minutos.' },
]

const sellos = [
  { icono: '📦', titulo: 'Stock en vivo', texto: 'Sabes qué hay antes de ir' },
  { icono: '⏱️', titulo: 'Recoge sin fila', texto: 'En tu franja de 30 min' },
  { icono: '🏷️', titulo: 'Mismo precio', texto: 'Igual que en tienda' },
]

const fotosHero = ['arroz-5kg', 'huevos-15', 'papa-1kg', 'pollo-1kg']

// Comentarios de respaldo si aún no hay encuestas guardadas (se toman de los datos de demostración).
const opinionesRespaldo = encuestasDemo(0).filter((e) => e.comentario && e.puntaje >= 9)

export default function HomePage() {
  const { tiendaId, setTienda, carrito, agregarAlCarrito, encuestas, pedidos, cargarDemo, reiniciarDemo } = useApp()
  const tienda = getTienda(tiendaId)
  const { hash } = useLocation()
  const [aviso, setAviso] = useState<{ canastaId: string; texto: string } | null>(null)

  // Los enlaces «/#seccion» del menú y del pie de página bajan hasta la sección.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  const opiniones = [...encuestas.filter((e) => e.comentario && e.puntaje >= 9), ...opinionesRespaldo].slice(0, 3)

  // Agrega la canasta respetando el stock de la tienda (descuenta lo que ya está en el carrito).
  const agregarCanasta = (c: Canasta) => {
    const faltan: string[] = []
    let agregados = 0
    c.items.forEach((i) => {
      const enCarrito = carrito.find((x) => x.productoId === i.productoId)?.cantidad ?? 0
      const libre = Math.max((stock[tiendaId]?.[i.productoId] ?? 0) - enCarrito, 0)
      const cantidad = Math.min(i.cantidad, libre)
      if (cantidad > 0) {
        agregarAlCarrito(i.productoId, cantidad)
        agregados++
      }
      if (cantidad < i.cantidad) faltan.push(getProducto(i.productoId)?.nombre ?? i.productoId)
    })
    setAviso({
      canastaId: c.id,
      texto:
        agregados === 0
          ? `Hoy no hay stock de estos productos en ${tienda?.nombre}. Prueba con otra tienda.`
          : faltan.length
            ? `Agregamos ${agregados} de ${c.items.length} productos. En ${tienda?.nombre} no alcanza: ${faltan.join(', ')}.`
            : `¡Listo! Agregamos los ${c.items.length} productos a tu carrito.`,
    })
  }

  return (
    <div className="space-y-16">
      {/* Hero: propuesta de valor + sellos de confianza (cada sello responde a un dolor del journey) */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-soft p-6 sm:p-10 lg:p-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-surface/80 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand">
              Nuevo · Pide y recoge
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Barato en precio.
              <br />
              <span className="text-brand">Barato en tiempo.</span>
            </h1>
            <p className="max-w-md text-lg font-medium text-ink-muted">
              Compra tu canasta desde el celular y recógela sin hacer cola en {tienda?.nombre ?? 'tu tienda'}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalogo">
                <Button className="px-7 py-3">Empezar mi pedido</Button>
              </Link>
              <a href="#canastas">
                <Button variante="secondary" className="px-7 py-3">
                  Ver canastas
                </Button>
              </a>
            </div>
            <ul className="grid grid-cols-3 gap-3 border-t border-brand/15 pt-5">
              {sellos.map((s) => (
                <li key={s.titulo} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2.5">
                  <span className="text-xl" aria-hidden>
                    {s.icono}
                  </span>
                  <div>
                    <p className="text-xs font-bold sm:text-sm">{s.titulo}</p>
                    <p className="text-[11px] text-ink-muted sm:text-xs">{s.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="grid grid-cols-2 gap-3">
              {fotosHero.map((id, i) => {
                const p = getProducto(id)
                return (
                  <img
                    key={id}
                    src={p?.foto}
                    alt={p ? `${p.nombre} ${p.presentacion}` : ''}
                    className={`aspect-square w-full rounded-2xl bg-surface object-cover shadow-md ${i % 2 ? 'translate-y-6' : ''}`}
                  />
                )
              })}
            </div>
            <div className="absolute -bottom-2 left-1/2 w-60 -translate-x-1/2 rounded-2xl border border-line bg-surface p-3 text-sm shadow-lg">
              <p className="text-xs font-semibold text-ok">Tiendas 3A · Pide y recoge</p>
              <p className="mt-0.5">¡Tu pedido está listo! ✅ Recógelo en el mostrador, sin fila.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="h-como">
        <SectionHeader id="h-como" titulo="Así de fácil" descripcion="Tres pasos y te olvidas de la cola en hora punta." />
        <div className="grid gap-4 sm:grid-cols-3">
          {pasos.map((p) => (
            <Card key={p.n} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold text-white">{p.n}</span>
              <div>
                <p className="font-bold">{p.titulo}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{p.texto}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Canastas: el cliente compra semanal o quincenal y el bodeguero por volumen; un toque arma el carrito */}
      <section id="canastas" aria-labelledby="h-canastas" className="scroll-mt-24 rounded-3xl bg-accent-soft p-5 sm:p-8">
        <SectionHeader id="h-canastas" titulo="Canastas armadas" descripcion={`Un toque y tu compra está lista. Precios y stock de ${tienda?.nombre}.`}>
          <Link to="/catalogo" className="text-sm font-bold text-brand hover:underline">
            Armar la mía →
          </Link>
        </SectionHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {canastas.map((c) => {
            const total = totalItems(c.items)
            const sinVolumen = c.items.reduce((s, i) => s + (getProducto(i.productoId)?.precio ?? 0) * i.cantidad, 0)
            const ahorro = Math.round((sinVolumen - total) * 100) / 100
            const unidades = c.items.reduce((n, i) => n + i.cantidad, 0)
            return (
              <Card key={c.id} className="flex flex-col transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-4xl" aria-hidden>
                    {c.emoji}
                  </span>
                  {ahorro > 0 && <Badge tono="ok">Ahorras {formatSoles(ahorro)}</Badge>}
                </div>
                <h3 className="mt-3 text-lg font-bold">{c.nombre}</h3>
                <p className="text-sm text-ink-muted">{c.para}</p>
                <p className="mt-3 text-xs text-ink-muted">
                  {c.items
                    .slice(0, 4)
                    .map((i) => `${i.cantidad} ${getProducto(i.productoId)?.nombre.toLowerCase()}`)
                    .join(' · ')}
                  {c.items.length > 4 && ` y ${c.items.length - 4} más`}
                </p>
                <div className="mt-auto pt-4">
                  <p className="text-2xl font-extrabold">{formatSoles(total)}</p>
                  <p className="text-xs text-ink-muted">{unidades} unidades</p>
                  <Button className="mt-3 w-full" onClick={() => agregarCanasta(c)}>
                    Agregar canasta
                  </Button>
                  {aviso?.canastaId === c.id && (
                    <p role="status" className="mt-2 text-xs text-ink-muted">
                      {aviso.texto}{' '}
                      <Link to="/pedido" className="font-semibold text-brand hover:underline">
                        Ver mi pedido
                      </Link>
                    </p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="ubicanos" aria-labelledby="h-ubicanos" className="scroll-mt-24">
        <SectionHeader id="h-ubicanos" titulo="Ubícanos" descripcion="Elige la tienda donde recogerás tu pedido. La espera en caja es la de hoy en hora punta." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiendas.map((t) => {
            const activa = t.id === tiendaId
            return (
              <button
                key={t.id}
                onClick={() => setTienda(t.id)}
                className={`rounded-2xl border bg-surface p-4 text-left shadow-sm transition-all hover:shadow-md ${activa ? 'border-brand ring-2 ring-brand-soft' : 'border-line'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">{t.nombre}</p>
                  {activa && <Badge tono="brand">Elegida</Badge>}
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {t.direccion} · {t.distrito}
                </p>
                <p className="mt-3 text-xs text-ink-muted">
                  {t.horario} · cola en caja ≈ <span className="font-semibold text-warn">{t.esperaCajaMin} min</span>
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Opiniones: salen de las encuestas NPS del Club (concepto del curso: NPS) */}
      <section aria-labelledby="h-opiniones">
        <SectionHeader id="h-opiniones" titulo="Lo que dicen nuestros clientes" descripcion="Comentarios reales de la encuesta NPS que responden al recoger su pedido." />
        <div className="grid gap-4 md:grid-cols-3">
          {opiniones.map((o, i) => (
            <Card key={i} className="space-y-3">
              <p className="text-sm font-bold text-warn" aria-label={`Puntaje ${o.puntaje} de 10`}>
                {o.puntaje}/10 · {'★'.repeat(5)}
              </p>
              <p className="text-sm italic text-ink">«{o.comentario}»</p>
              <p className="text-xs text-ink-muted">Cliente de {getTienda(o.tiendaId)?.nombre}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="del-dolor" aria-labelledby="h-dolor" className="scroll-mt-24">
        <SectionHeader id="h-dolor" titulo="Del dolor a la solución" descripcion="Cada parte de esta experiencia responde a un punto de dolor del customer journey.">
          <Link to="/journey" className="text-sm font-bold text-brand hover:underline">
            Ver antes y después →
          </Link>
        </SectionHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modulos
            .filter((m) => m.id !== 'base')
            .map((m) => (
              <Link key={m.id} to={m.ruta}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <p className="text-sm text-ink-muted">{m.dolor}</p>
                  <p className="mt-3 font-bold text-brand-dark">{m.nombre} →</p>
                  {m.id === 'panel' && <p className="mt-1 text-xs text-ink-muted">Solo administrador de tienda</p>}
                </Card>
              </Link>
            ))}
        </div>
      </section>

      {/* Para la presentación en vivo: llena el Panel, Seguimiento y Club con pedidos y encuestas de ejemplo. */}
      <section aria-labelledby="h-demo">
        <Card className="flex flex-wrap items-center justify-between gap-4 border-dashed shadow-none">
          <div>
            <h2 id="h-demo" className="font-bold">
              Modo demostración
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Carga pedidos y encuestas de ejemplo para ver el panel, el seguimiento y el Club con datos. Ahora hay{' '}
              {pedidos.length} pedidos y {encuestas.length} encuestas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variante="secondary" onClick={cargarDemo}>
              Cargar datos de ejemplo
            </Button>
            <Button variante="ghost" onClick={() => confirm('¿Borrar pedidos, encuestas y carrito de esta demo?') && reiniciarDemo()}>
              Reiniciar
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
