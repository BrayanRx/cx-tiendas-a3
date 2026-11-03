import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Carrusel from '@/components/Carrusel'
import Icono, { type NombreIcono } from '@/components/Icono'
import { Badge, Button, SectionHeader } from '@/components/ui'
import { canastas, type Canasta } from '@/data/canastas'
import { encuestasDemo } from '@/data/demo'
import { categorias, getProducto } from '@/data/productos'
import { getTienda, stock, tiendas } from '@/data/tiendas'
import { formatFecha, formatSoles } from '@/lib/format'
import { totalItems, useApp } from '@/lib/store'
import type { Categoria, RespuestaNps } from '@/lib/types'

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

const masPedidos = ['arroz-5kg', 'huevos-15', 'pollo-1kg', 'fideos-500', 'atun-170', 'papa-1kg', 'queso-500', 'avena-900', 'azucar-1kg']

const STOCK_BAJO = 8

// Categorías que aparecen en «Lo más pedido», para los filtros tipo píldora.
const categoriasPopulares = categorias.filter((c) => masPedidos.some((id) => getProducto(id)?.categoria === c.id))

/** Ahorro del pack bodeguero frente a comprar lo mismo a precio normal. */
const packBodeguero = canastas.find((c) => c.id === 'bodeguero')
const ahorroBodeguero = packBodeguero
  ? Math.round((packBodeguero.items.reduce((s, i) => s + (getProducto(i.productoId)?.precio ?? 0) * i.cantidad, 0) - totalItems(packBodeguero.items)) * 100) / 100
  : 0

/** Minutos que toma recoger en el mostrador «Pide y recoge» (el mismo valor que usa el Panel). */
const RECOJO_MIN = 2

// Encuestas de respaldo si aún no hay ninguna guardada (se toman de los datos de demostración).
const encuestasRespaldo = encuestasDemo(Date.now())

/** Resumen NPS: % promotores (9-10) − % detractores (0-6), más el reparto y el promedio. */
function resumenNps(lista: RespuestaNps[]) {
  const n = lista.length || 1
  const pct = (f: (e: RespuestaNps) => boolean) => Math.round((lista.filter(f).length / n) * 100)
  const promotores = pct((e) => e.puntaje >= 9)
  const detractores = pct((e) => e.puntaje <= 6)
  return {
    nps: promotores - detractores,
    promotores,
    pasivos: 100 - promotores - detractores,
    detractores,
    promedio: lista.reduce((s, e) => s + e.puntaje, 0) / n,
    total: lista.length,
  }
}

/** Cinco estrellas a partir del puntaje de 0 a 10 (media estrella por punto). */
function Estrellas({ puntaje, className = 'size-4' }: { puntaje: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-warn" aria-label={`${puntaje} de 10`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${className} ${puntaje / 2 >= i - 0.25 ? '' : 'text-line'}`} fill="currentColor" aria-hidden>
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
      ))}
    </span>
  )
}

export default function HomePage() {
  const { tiendaId, setTienda, carrito, agregarAlCarrito, encuestas, pedidos, cargarDemo, reiniciarDemo } = useApp()
  const tienda = getTienda(tiendaId)
  const { hash } = useLocation()
  const [aviso, setAviso] = useState<{ canastaId: string; texto: string } | null>(null)
  const [filtro, setFiltro] = useState<Categoria | 'todas'>('todas')
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

  const fuenteNps = encuestas.length ? encuestas : encuestasRespaldo
  const resumen = resumenNps(fuenteNps)
  const opiniones = fuenteNps
    .filter((e) => e.comentario && e.puntaje >= 8)
    .sort((a, b) => b.puntaje - a.puntaje || b.fecha - a.fecha)
    .slice(0, 6)
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
      {/* Hero dividido: mensaje a la izquierda y bloque de color con fotos en círculo a la derecha */}
      <section className="relative overflow-hidden rounded-3xl bg-surface shadow-sm lg:grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative z-10 space-y-6 p-6 sm:p-10 lg:p-14">
          <p className="text-xl font-extrabold italic text-accent sm:text-2xl">Pide y recoge</p>
          <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            Barato en precio.
            <span className="block text-brand">Barato en tiempo.</span>
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
          <ul className="grid grid-cols-3 gap-3 border-t border-line pt-5">
            {sellos.map((s) => (
              <li key={s.titulo} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
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

        <div className="relative h-72 overflow-hidden bg-brand sm:h-96 lg:h-auto lg:rounded-tl-[6rem]" aria-hidden>
          <span className="absolute -left-2 top-4 select-none whitespace-nowrap text-[6.5rem] font-black uppercase leading-none text-white/10 sm:text-[9rem]">
            Ahorra
          </span>
          <span className="absolute -bottom-20 -right-20 size-72 rounded-full border-[28px] border-sun/70" />
          <span className="absolute left-8 top-1/2 size-5 rounded-full bg-sun" />
          <span className="absolute right-12 top-10 size-3 rounded-full bg-white/60" />
          <img
            src={getProducto('huevos-15')?.foto}
            alt=""
            className="absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-white object-cover shadow-2xl sm:size-64"
          />
          <img
            src={getProducto('papa-1kg')?.foto}
            alt=""
            className="absolute bottom-6 left-6 size-20 rounded-full border-4 border-white object-cover shadow-xl sm:size-28"
          />
          <img
            src={getProducto('arroz-5kg')?.foto}
            alt=""
            className="absolute right-6 top-6 size-20 rounded-full border-4 border-white object-cover shadow-xl sm:size-24"
          />
          <div className="absolute bottom-5 right-5 hidden w-56 rounded-2xl bg-surface p-3 text-sm text-ink shadow-xl sm:block">
            <p className="flex items-center gap-1 text-xs font-semibold text-ok">
              <Icono nombre="check" className="size-3.5" /> Tiendas 3A · Pide y recoge
            </p>
            <p className="mt-0.5">¡Tu pedido está listo! Recógelo en el mostrador, sin fila.</p>
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

      {/* Banners de promoción: bloques de color con datos reales del catálogo y de la tienda */}
      <section aria-label="Promociones" className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-sun p-7 sm:p-9">
          <span className="absolute -right-10 -top-10 size-40 rounded-full border-[18px] border-white/40" aria-hidden />
          <img
            src={getProducto('arroz-5kg')?.foto}
            alt=""
            className="absolute -bottom-6 -right-6 size-36 rounded-full border-[6px] border-white object-cover shadow-xl sm:size-44"
          />
          <div className="relative max-w-[60%]">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/70">Pack bodeguero</p>
            <p className="mt-2 text-3xl font-black uppercase leading-none sm:text-4xl">
              Ahorra <span className="text-brand-dark">{formatSoles(ahorroBodeguero)}</span>
            </p>
            <p className="mt-3 text-sm text-ink/80">Precio por volumen en arroz, aceite, azúcar y leche.</p>
            <a href="#canastas" className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink/85">
              Ver el pack <Icono nombre="flecha" className="size-4" />
            </a>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-accent p-7 text-white sm:p-9">
          <span className="absolute -right-10 -top-10 size-40 rounded-full border-[18px] border-white/10" aria-hidden />
          <img
            src={getProducto('pollo-1kg')?.foto}
            alt=""
            className="absolute -bottom-6 -right-6 size-36 rounded-full border-[6px] border-white object-cover shadow-xl sm:size-44"
          />
          <div className="relative max-w-[60%]">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Pide y recoge</p>
            <p className="mt-2 text-3xl font-black uppercase leading-none sm:text-4xl">
              {RECOJO_MIN} min, <span className="text-sun">no {tienda?.esperaCajaMin}</span>
            </p>
            <p className="mt-3 text-sm text-white/80">Es lo que tardas en recoger frente a la cola de hoy en caja.</p>
            <Link to="/catalogo" className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-white/90">
              Empezar <Icono nombre="flecha" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Canastas: el cliente compra semanal o quincenal y el bodeguero por volumen; un toque arma el carrito */}
      <section id="canastas" aria-labelledby="h-canastas" className="scroll-mt-24">
        <SectionHeader id="h-canastas" centrado titulo="Canastas" resaltado="armadas" descripcion={`Un toque y tu compra está lista. Precios y stock de ${tienda?.nombre}.`} />
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
        <SectionHeader id="h-populares" centrado titulo="Lo más" resaltado="pedido" descripcion="Lo que más llevan tus vecinos esta semana." />
        <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:justify-center">
          {[{ id: 'todas' as const, nombre: 'Todo' }, ...categoriasPopulares].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filtro === c.id}
              onClick={() => setFiltro(c.id)}
              className={`shrink-0 rounded-full border-2 px-5 py-1.5 text-sm font-semibold transition-colors ${filtro === c.id ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink-muted hover:border-brand hover:text-brand'}`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
        <Carrusel key={filtro} etiqueta="Lo más pedido">
          {masPedidos.map((id) => {
            const p = getProducto(id)
            if (!p || (filtro !== 'todas' && p.categoria !== filtro)) return null
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
        <SectionHeader id="h-ubicanos" centrado titulo="Tu" resaltado="tienda" descripcion="Aquí recoges tu pedido. Mira cuánto tiempo te ahorras hoy." />
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

      {/* Opiniones: resumen NPS (concepto del curso) + comentarios de la encuesta que responden al recoger */}
      <section aria-labelledby="h-opiniones">
        <SectionHeader id="h-opiniones" centrado titulo="Lo que dicen" resaltado="nuestros clientes" descripcion="Cada cliente califica su experiencia al recoger su pedido." />
        <div className="grid gap-6 lg:grid-cols-[19rem_1fr] lg:items-start">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">Net Promoter Score</p>
            <div className="mt-2 flex items-end gap-3">
              <span className={`text-5xl font-extrabold leading-none ${resumen.nps >= 0 ? 'text-ok' : 'text-bad'}`}>{resumen.nps > 0 ? `+${resumen.nps}` : resumen.nps}</span>
              <span className="pb-1 text-sm text-ink-muted">de −100 a +100</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Estrellas puntaje={resumen.promedio} />
              <span className="font-semibold">{resumen.promedio.toFixed(1)}/10</span>
              <span className="text-ink-muted">· {resumen.total} encuestas</span>
            </div>
            <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-canvas" aria-hidden>
              <span className="bg-ok" style={{ width: `${resumen.promotores}%` }} />
              <span className="bg-warn/60" style={{ width: `${resumen.pasivos}%` }} />
              <span className="bg-bad" style={{ width: `${resumen.detractores}%` }} />
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              {[
                { etiqueta: 'Promotores (9-10)', valor: resumen.promotores, color: 'bg-ok' },
                { etiqueta: 'Pasivos (7-8)', valor: resumen.pasivos, color: 'bg-warn/60' },
                { etiqueta: 'Detractores (0-6)', valor: resumen.detractores, color: 'bg-bad' },
              ].map((f) => (
                <div key={f.etiqueta} className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-muted">
                    <span className={`size-2.5 rounded-full ${f.color}`} />
                    {f.etiqueta}
                  </dt>
                  <dd className="font-semibold">{f.valor}%</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0">
            <Carrusel etiqueta="Opiniones de clientes">
              {opiniones.map((o, i) => {
                const t = getTienda(o.tiendaId)
                return (
                  <figure key={i} className="flex w-[85%] shrink-0 flex-col rounded-3xl border border-line bg-surface p-6 shadow-sm sm:w-80">
                    <div className="flex items-center justify-between gap-2">
                      <Estrellas puntaje={o.puntaje} />
                      <span className="text-xs text-ink-muted">{formatFecha(o.fecha)}</span>
                    </div>
                    <blockquote className="mt-4 flex-1 text-base font-medium leading-relaxed">“{o.comentario}”</blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4 text-sm">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                        <Icono nombre="usuario" className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">Cliente de {t?.distrito}</span>
                        <span className="flex items-center gap-1 text-xs text-ok">
                          <Icono nombre="check" className="size-3.5" /> Recogió sin fila · {t?.nombre.replace('Tienda ', '')}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                )
              })}
            </Carrusel>
          </div>
        </div>
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
