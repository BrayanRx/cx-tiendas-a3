import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Carrusel from '@/components/Carrusel'
import Icono, { type NombreIcono } from '@/components/Icono'
import { Badge, Button, SectionHeader } from '@/components/ui'
import { canastas, type Canasta } from '@/data/canastas'
import { encuestasDemo } from '@/data/demo'
import { getProducto } from '@/data/productos'
import { getTienda, stock, tiendas } from '@/data/tiendas'
import { formatSoles } from '@/lib/format'
import { totalItems, useApp } from '@/lib/store'

// Responsable: Brayan Rojas · rama feat/base
// Dolor que resuelve: poca presencia digital (el cliente no descubre ni ubica la tienda).
// Lee: tiendaId, carrito, encuestas (useApp), stock (@/data/tiendas), canastas (@/data/canastas)
// Escribe: setTienda, agregarAlCarrito (canastas y lo más pedido), cargarDemo y reiniciarDemo (modo demostración)

const pasos = ['Elige tu tienda', 'Arma tu pedido', 'Paga con QR', 'Recoge sin fila']

const sellos: { icono: NombreIcono; titulo: string; texto: string }[] = [
  { icono: 'caja', titulo: 'Stock en vivo', texto: 'Sabes qué hay antes de ir' },
  { icono: 'reloj', titulo: 'Recoge sin fila', texto: 'En tu franja de 30 min' },
  { icono: 'etiqueta', titulo: 'Mismo precio', texto: 'Igual que en tienda' },
]

// Cada canasta con su propio color para que no se vean iguales.
const fondoCanasta: Record<string, string> = {
  semanal: 'bg-brand-soft',
  quincenal: 'bg-accent-soft',
  bodeguero: 'bg-amber-50',
}

const fotosHero = ['arroz-5kg', 'huevos-15', 'papa-1kg', 'pollo-1kg']
const masPedidos = ['arroz-5kg', 'huevos-15', 'pollo-1kg', 'fideos-500', 'atun-170', 'papa-1kg', 'queso-500', 'avena-900', 'azucar-1kg']

const STOCK_BAJO = 8

/** Minutos que toma recoger en el mostrador «Pide y recoge» (el mismo valor que usa el Panel). */
const RECOJO_MIN = 2

// Comentarios de respaldo si aún no hay encuestas guardadas (se toman de los datos de demostración).
const opinionesRespaldo = encuestasDemo(0).filter((e) => e.comentario && e.puntaje >= 9)

export default function HomePage() {
  const { tiendaId, setTienda, carrito, agregarAlCarrito, encuestas, pedidos, cargarDemo, reiniciarDemo } = useApp()
  const tienda = getTienda(tiendaId)
  const { hash } = useLocation()
  const [aviso, setAviso] = useState<{ canastaId: string; texto: string } | null>(null)
  // Aviso emergente al agregar un producto (se oculta solo a los 3 segundos).
  const [toast, setToast] = useState<string | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined)
  const avisar = (texto: string) => {
    setToast(texto)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setToast(null), 3000)
  }
  useEffect(() => () => clearTimeout(temporizador.current), [])

  // Los enlaces «/#seccion» del menú y del pie de página bajan hasta la sección.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  const opiniones = [...encuestas.filter((e) => e.comentario && e.puntaje >= 9), ...opinionesRespaldo].slice(0, 5)
  const libre = (productoId: string) =>
    Math.max((stock[tiendaId]?.[productoId] ?? 0) - (carrito.find((x) => x.productoId === productoId)?.cantidad ?? 0), 0)

  // Agrega la canasta respetando el stock de la tienda (descuenta lo que ya está en el carrito).
  const agregarCanasta = (c: Canasta) => {
    const faltan: string[] = []
    let agregados = 0
    c.items.forEach((i) => {
      const cantidad = Math.min(i.cantidad, libre(i.productoId))
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
            ? `Agregamos ${agregados} de ${c.items.length} productos. No alcanza: ${faltan.join(', ')}.`
            : `¡Listo! Agregamos los ${c.items.length} productos.`,
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
            <div className="grid gap-3 sm:flex">
              <Link to="/catalogo">
                <Button className="w-full px-7 py-3 sm:w-auto">
                  Empezar mi pedido <Icono nombre="flecha" className="size-4" />
                </Button>
              </Link>
              <a href="#canastas">
                <Button variante="secondary" className="w-full px-7 py-3 sm:w-auto">
                  Ver canastas
                </Button>
              </a>
            </div>
            <ul className="grid grid-cols-3 gap-3 border-t border-brand/15 pt-5">
              {sellos.map((s) => (
                <li key={s.titulo} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-brand shadow-sm">
                    <Icono nombre={s.icono} />
                  </span>
                  <div>
                    <p className="text-xs font-bold sm:text-sm">{s.titulo}</p>
                    <p className="text-[11px] text-ink-muted sm:text-xs">{s.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto hidden w-full max-w-md sm:block">
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

      {/* Cómo funciona: una sola línea, sin tarjetas */}
      <section aria-label="Cómo funciona">
        <ol className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-semibold sm:flex sm:items-center sm:justify-center sm:gap-x-3 sm:text-base">
          {pasos.map((p, i) => (
            <li key={p} className="flex items-center gap-3">
              {i > 0 && (
                <span className="hidden text-line sm:inline" aria-hidden>
                  ──
                </span>
              )}
              <span className="grid size-7 place-items-center rounded-full bg-brand text-xs text-white">{i + 1}</span>
              {p}
            </li>
          ))}
        </ol>
      </section>

      {/* Canastas: el cliente compra semanal o quincenal y el bodeguero por volumen; un toque arma el carrito */}
      <section id="canastas" aria-labelledby="h-canastas" className="scroll-mt-24">
        <SectionHeader id="h-canastas" centrado titulo="Canastas armadas" descripcion={`Un toque y tu compra está lista. Precios y stock de ${tienda?.nombre}.`} />
        <Carrusel etiqueta="Canastas armadas">
          {canastas.map((c) => {
            const total = totalItems(c.items)
            const sinVolumen = c.items.reduce((s, i) => s + (getProducto(i.productoId)?.precio ?? 0) * i.cantidad, 0)
            const ahorro = Math.round((sinVolumen - total) * 100) / 100
            const fotos = c.items.map((i) => getProducto(i.productoId)).filter((p) => p?.foto).slice(0, 3)
            return (
              <article
                key={c.id}
                className="flex w-[85%] shrink-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-80 lg:w-[calc((100%-2rem)/3)]"
              >
                <div className={`flex items-center justify-between gap-2 px-6 py-5 ${fondoCanasta[c.id]}`}>
                  <div className="flex -space-x-3">
                    {fotos.map((p) => (
                      <img key={p!.id} src={p!.foto} alt="" className="size-14 rounded-full border-[3px] border-surface object-cover shadow-sm" />
                    ))}
                  </div>
                  {ahorro > 0 && <Badge tono="ok">Ahorras {formatSoles(ahorro)}</Badge>}
                </div>
                <div className="flex flex-1 flex-col p-6 pt-5">
                  <h3 className="text-xl font-extrabold">{c.nombre}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{c.para}</p>
                  <ul className="mt-4 mb-5 space-y-1.5 text-sm">
                    {c.items.slice(0, 4).map((i) => (
                      <li key={i.productoId} className="flex items-center gap-2">
                        <Icono nombre="check" className="size-4 shrink-0 text-ok" />
                        <span>
                          {i.cantidad} × {getProducto(i.productoId)?.nombre}
                        </span>
                      </li>
                    ))}
                    {c.items.length > 4 && <li className="pl-6 text-ink-muted">y {c.items.length - 4} productos más</li>}
                  </ul>
                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-line pt-4">
                    <div>
                      <p className="text-xs text-ink-muted">{c.items.reduce((n, i) => n + i.cantidad, 0)} unidades</p>
                      <p className="text-2xl font-extrabold">{formatSoles(total)}</p>
                    </div>
                    <Button onClick={() => agregarCanasta(c)}>
                      <Icono nombre="carrito" className="size-4" /> Agregar
                    </Button>
                  </div>
                  {aviso?.canastaId === c.id && (
                    <p role="status" className="mt-3 text-xs text-ink-muted">
                      {aviso.texto}{' '}
                      <Link to="/pedido" className="font-semibold text-brand hover:underline">
                        Ver mi pedido
                      </Link>
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </Carrusel>
        <p className="mt-4 text-center">
          <Link to="/catalogo" className="text-sm font-bold text-brand hover:underline">
            ¿Prefieres armar la tuya? Ir al catálogo →
          </Link>
        </p>
      </section>

      {/* Lo más pedido: tarjetas con foto que se elevan al pasar; el botón confirma con un aviso */}
      <section aria-labelledby="h-populares" className="bg-puntos -mx-4 px-4 py-12 sm:mx-0 sm:rounded-3xl sm:px-8">
        <SectionHeader id="h-populares" centrado titulo="Lo más pedido" descripcion="Lo que más llevan tus vecinos esta semana." />
        <Carrusel etiqueta="Lo más pedido">
          {masPedidos.map((id) => {
            const p = getProducto(id)
            if (!p) return null
            const disponible = libre(p.id)
            const quedan = stock[tiendaId]?.[p.id] ?? 0
            return (
              <article
                key={p.id}
                className="group w-40 shrink-0 rounded-2xl border border-line bg-surface p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-52"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={p.foto}
                    alt={`${p.nombre} ${p.presentacion}`}
                    className={`aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105 ${quedan === 0 ? 'opacity-50 grayscale' : ''}`}
                  />
                  {p.marcaPropia && (
                    <span className="absolute left-2 top-2">
                      <Badge tono="brand">Marca propia</Badge>
                    </span>
                  )}
                  {quedan === 0 ? (
                    <span className="absolute bottom-2 left-2">
                      <Badge tono="bad">Agotado aquí</Badge>
                    </span>
                  ) : (
                    quedan <= STOCK_BAJO && (
                      <span className="absolute bottom-2 left-2">
                        <Badge tono="warn">Quedan {quedan}</Badge>
                      </span>
                    )
                  )}
                </div>
                <div className="px-1.5 pb-1 pt-3">
                  <p className="truncate font-semibold">{p.nombre}</p>
                  <p className="text-xs text-ink-muted">
                    {p.marca} · {p.presentacion}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-extrabold">{formatSoles(p.precio)}</span>
                    <button
                      type="button"
                      aria-label={`Agregar ${p.nombre} al carrito`}
                      disabled={disponible === 0}
                      onClick={() => {
                        agregarAlCarrito(p.id)
                        avisar(`${p.nombre} agregado a tu carrito`)
                      }}
                      className="grid size-10 place-items-center rounded-full bg-brand text-white shadow-sm transition-colors hover:bg-brand-dark disabled:bg-line disabled:text-ink-muted"
                    >
                      <Icono nombre="mas" className="size-5" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </Carrusel>
        <p className="mt-6 text-center">
          <Link to="/catalogo">
            <Button variante="secondary">Ver todo el catálogo</Button>
          </Link>
        </p>
      </section>

      {/* Ubícanos: la tienda elegida destacada y una fila para cambiarla */}
      <section id="ubicanos" aria-labelledby="h-ubicanos" className="scroll-mt-24">
        <SectionHeader id="h-ubicanos" centrado titulo="Tu tienda" descripcion="Aquí recoges tu pedido. Mira cuánto tiempo te ahorras hoy." />
        {tienda && (
          <div className="grid gap-6 rounded-3xl bg-accent p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div>
              <p className="text-2xl font-extrabold">{tienda.nombre}</p>
              <p className="mt-1 text-white/80">
                {tienda.direccion} · {tienda.distrito}
              </p>
              <p className="text-white/80">Abierto {tienda.horario}</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-3xl font-extrabold">{tienda.esperaCajaMin} min</p>
                <p className="text-xs text-white/80">cola en caja hoy</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-brand-light">{RECOJO_MIN} min</p>
                <p className="text-xs text-white/80">con Pide y recoge</p>
              </div>
            </div>
          </div>
        )}
        <p className="mt-5 mb-2 text-sm font-semibold text-ink-muted">¿Te queda más cerca otra?</p>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {tiendas.map((t) => {
            const activa = t.id === tiendaId
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={activa}
                onClick={() => setTienda(t.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-left text-sm transition-colors ${activa ? 'border-brand bg-brand text-white' : 'border-line bg-surface hover:border-ink-muted'}`}
              >
                <span className="font-semibold">{t.distrito}</span>
                <span className={activa ? 'text-white/80' : 'text-ink-muted'}> · {t.esperaCajaMin} min de cola</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Opiniones: salen de las encuestas NPS del Club (concepto del curso: NPS) */}
      <section aria-labelledby="h-opiniones">
        <SectionHeader id="h-opiniones" centrado titulo="Lo que dicen nuestros clientes" descripcion="Comentarios de la encuesta NPS que responden al recoger su pedido." />
        <Carrusel etiqueta="Opiniones de clientes">
          {opiniones.map((o, i) => {
            const t = getTienda(o.tiendaId)
            return (
              <figure key={i} className="relative w-[85%] shrink-0 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm sm:w-96">
                <span className="absolute -top-4 right-4 text-8xl font-extrabold leading-none text-brand-soft" aria-hidden>
                  ”
                </span>
                <p className="relative text-sm text-warn" aria-label={`Puntaje ${o.puntaje} de 10`}>
                  ★★★★★
                </p>
                <blockquote className="relative mt-3 text-lg font-semibold leading-snug">{o.comentario}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 text-sm">
                  <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                    {t?.distrito.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </span>
                  <span>
                    <span className="block font-semibold">Cliente de Pide y recoge</span>
                    <span className="text-xs text-ink-muted">
                      {t?.nombre} · NPS {o.puntaje}/10
                    </span>
                  </span>
                </figcaption>
              </figure>
            )
          })}
        </Carrusel>
      </section>

      {/* Del dolor a la solución: un solo banner que lleva a la comparación completa */}
      <section id="del-dolor" className="scroll-mt-24">
        <Link
          to="/journey"
          className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink p-6 text-white transition-opacity hover:opacity-95 sm:p-8"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-light">Del dolor a la solución</p>
            <p className="mt-2 max-w-xl text-xl font-extrabold sm:text-2xl">7 dolores del cliente de hoy, 7 pantallas que los resuelven.</p>
          </div>
          <span className="rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink">Ver antes y después →</span>
        </Link>
      </section>

      {/* Para la presentación en vivo: llena el Panel, Seguimiento y Club con pedidos y encuestas de ejemplo. */}
      <section aria-label="Modo demostración" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-ink-muted">
        <span>
          Modo demostración · {pedidos.length} pedidos y {encuestas.length} encuestas
        </span>
        <button type="button" onClick={cargarDemo} className="font-semibold text-brand hover:underline">
          Cargar datos de ejemplo
        </button>
        <button
          type="button"
          onClick={() => confirm('¿Borrar pedidos, encuestas y carrito de esta demo?') && reiniciarDemo()}
          className="hover:text-ink hover:underline"
        >
          Reiniciar
        </button>
      </section>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-4 z-40 flex items-center gap-3 rounded-2xl bg-ink p-3 pr-4 text-sm text-white shadow-lg sm:left-auto sm:right-6 sm:w-96"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ok">
            <Icono nombre="check" className="size-4" />
          </span>
          <span className="flex-1">{toast}</span>
          <Link to="/pedido" className="font-semibold text-brand-light hover:underline">
            Ver pedido
          </Link>
        </div>
      )}
    </div>
  )
}
