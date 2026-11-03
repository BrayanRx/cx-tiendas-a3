import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CodigoQr from '@/components/CodigoQr'
import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { getProducto } from '@/data/productos'
import { getTienda } from '@/data/tiendas'
import { formatSoles } from '@/lib/format'
import { precioUnitario, totalItems, useApp } from '@/lib/store'
import type { MetodoPago } from '@/lib/types'

// Responsable: Nicole Auqui - rama feat/pedido
// Dolor que resuelve: colas en caja ("Barato en precio, barato en tiempo")
// Concepto del curso: blueprint front-stage (cliente elige y paga) / back-stage (tienda prepara)
// Lee: carrito, tiendaId (useApp, @/lib/store), esperaCajaMin, horario (tienda)
// Escribe: cambiarCantidad, quitarDelCarrito, crearPedido -> navega a /seguimiento/:id

type Paso = 'carrito' | 'pago' | 'qr'

const METODOS: { id: MetodoPago; etiqueta: string; icono: string; descripcion: string }[] = [
  { id: 'qr',                 etiqueta: 'Pago QR',            icono: '📱', descripcion: 'Escanea con Yape, Plin o tu app bancaria' },
  { id: 'tarjeta',            etiqueta: 'Tarjeta',            icono: '💳', descripcion: 'Débito o crédito, pagas ahora desde tu celular' },
  { id: 'efectivo-en-tienda', etiqueta: 'Efectivo en tienda', icono: '💵', descripcion: 'Pagas en caja solo al momento de recoger' },
]

interface HorarioTienda {
  aperturaMin: number
  cierreMin: number
  aperturaTexto: string
  cierreTexto: string
}

function parseHorario(horarioStr?: string): HorarioTienda {
  const fallback: HorarioTienda = {
    aperturaMin: 7 * 60,
    cierreMin: 22 * 60,
    aperturaTexto: '07:00',
    cierreTexto: '22:00',
  }
  if (!horarioStr) return fallback

  const partes = horarioStr.split(/[–-]/).map((s) => s.trim())
  if (partes.length < 2) return fallback

  const aMinutosYTexto = (h: string, horaDefecto: number) => {
    const [hh, mm] = h.split(':').map((n) => parseInt(n, 10))
    const hora = isNaN(hh) ? horaDefecto : hh
    const minuto = isNaN(mm) ? 0 : mm
    const pad = (n: number) => String(n).padStart(2, '0')
    return {
      minutos: hora * 60 + minuto,
      texto: `${pad(hora)}:${pad(minuto)}`,
    }
  }

  const ap = aMinutosYTexto(partes[0], 7)
  const ci = aMinutosYTexto(partes[1], 22)

  return {
    aperturaMin: ap.minutos,
    cierreMin: ci.minutos,
    aperturaTexto: ap.texto,
    cierreTexto: ci.texto,
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const minAHora = (minTotal: number) => {
  const h = Math.floor(minTotal / 60) % 24
  const m = minTotal % 60
  return `${pad2(h)}:${pad2(m)}`
}

/** Genera franjas de recojo respetando la hora de apertura y cierre de la tienda. */
function generarFranjas(horarioStr?: string, ahora = new Date()): {
  franjas: string[]
  esParaManana: boolean
  cerradoHoy: boolean
  horario: HorarioTienda
} {
  const horario = parseHorario(horarioStr)
  const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes()
  const margenPreparacion = 20

  // Primer minuto en que el pedido podría estar listo hoy
  const primerMinPosible = ahoraMin + margenPreparacion

  // Si aún no abre la tienda hoy, el primer bloque arranca a la hora de apertura
  const inicioEfectivo = Math.max(primerMinPosible, horario.aperturaMin)

  // Redondear al siguiente bloque de 30 min (00 o 30)
  const primerBloqueMin = Math.ceil(inicioEfectivo / 30) * 30

  const franjasHoy: string[] = []
  for (let b = primerBloqueMin; b + 30 <= horario.cierreMin && franjasHoy.length < 6; b += 30) {
    franjasHoy.push(`${minAHora(b)} – ${minAHora(b + 30)}`)
  }

  // Si hoy quedan franjas, las usamos.
  // Si quedan menos de 3 franjas hoy (ej. queda solo la última franja antes del cierre),
  // añadimos también opciones de mañana para dar flexibilidad al cliente.
  if (franjasHoy.length > 0) {
    if (franjasHoy.length < 3) {
      for (let b = horario.aperturaMin; b + 30 <= horario.cierreMin && franjasHoy.length < 6; b += 30) {
        franjasHoy.push(`Mañana ${minAHora(b)} – ${minAHora(b + 30)}`)
      }
    }
    return {
      franjas: franjasHoy,
      esParaManana: false,
      cerradoHoy: false,
      horario,
    }
  }

  // No quedan franjas hoy (la tienda ya cerró o falta menos de 20 min para el cierre).
  // Se ofrecen las primeras franjas de mañana a partir de la hora de apertura.
  const franjasManana: string[] = []
  for (let b = horario.aperturaMin; b + 30 <= horario.cierreMin && franjasManana.length < 6; b += 30) {
    franjasManana.push(`Mañana ${minAHora(b)} – ${minAHora(b + 30)}`)
  }

  return {
    franjas: franjasManana,
    esParaManana: true,
    cerradoHoy: ahoraMin >= horario.cierreMin || primerMinPosible + 30 > horario.cierreMin,
    horario,
  }
}

// 2 min con Pide y recoge (alineado con Panel de tienda)
const RECOJO_MIN = 2

export default function PedidoPage() {
  const navigate = useNavigate()
  const { tiendaId, carrito, cambiarCantidad, quitarDelCarrito, crearPedido } = useApp()
  const tienda = getTienda(tiendaId)

  const { franjas, esParaManana, cerradoHoy, horario } = useMemo(
    () => generarFranjas(tienda?.horario),
    [tienda?.horario],
  )

  const [paso, setPaso] = useState<Paso>('carrito')
  const [franjaManual, setFranjaManual] = useState<string | null>(null)
  const franja = (franjaManual && franjas.includes(franjaManual)) ? franjaManual : (franjas[0] ?? '')
  const setFranja = (f: string) => setFranjaManual(f)

  const [metodo, setMetodo] = useState<MetodoPago>('qr')
  const [errorForm, setErrorForm] = useState('')
  const [pagando, setPagando] = useState(false)
  const [codigoQr] = useState(() => 'QR-' + Math.random().toString(36).slice(2, 8).toUpperCase())

  const total = totalItems(carrito)
  const ahorroMin = tienda ? Math.max(tienda.esperaCajaMin - RECOJO_MIN, 0) : 0

  function irAPago() {
    if (!carrito.length) return
    setErrorForm('')
    setPaso('pago')
  }

  function irAQrOConfirmar() {
    if (!franja) {
      setErrorForm('Elige una franja de recojo.')
      return
    }
    setErrorForm('')
    if (metodo === 'qr') {
      setPaso('qr')
    } else {
      finalizarPedido()
    }
  }

  function finalizarPedido() {
    const pedido = crearPedido({ franja, metodoPago: metodo })
    if (pedido) navigate(`/seguimiento/${pedido.id}`)
  }

  function simularPagoQr() {
    setPagando(true)
    setTimeout(finalizarPedido, 1800)
  }

  if (!carrito.length && paso === 'carrito') {
    return (
      <div>
        <PageHeader titulo="Tu pedido" descripcion="Arma tu canasta desde el catálogo y recoge sin hacer cola." />
        <Card className="py-10 text-center">
          <p className="text-5xl" aria-hidden>🛒</p>
          <p className="mt-3 text-lg font-semibold">Tu carrito está vacío</p>
          <p className="mt-1 text-sm text-ink-muted">Agrega productos y vuelve acá para pagar.</p>
          <Link
            to="/catalogo"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Ver catálogo
          </Link>
        </Card>
      </div>
    )
  }

  const PASOS: { id: Paso; label: string }[] = [
    { id: 'carrito', label: 'Carrito' },
    { id: 'pago', label: 'Pago' },
    { id: 'qr', label: 'Confirmar QR' },
  ]
  const idxActual = PASOS.findIndex((p) => p.id === paso)

  return (
    <div>
      <PageHeader
        titulo="Tu pedido"
        descripcion={`${tienda?.nombre ?? 'Tu tienda'} · ${tienda?.horario ?? ''}`}
      >
        {ahorroMin > 0 && (
          <Badge tono="ok">Ahorras ~{ahorroMin} min frente a la cola</Badge>
        )}
      </PageHeader>

      <ol aria-label="Pasos del pedido" className="mb-6 flex items-center gap-2 text-xs font-medium">
        {PASOS.map((p, i) => {
          const activo = i === idxActual
          const completado = i < idxActual
          return (
            <li key={p.id} className="flex items-center gap-2">
              {i > 0 && <span className="text-ink-muted" aria-hidden>&rsaquo;</span>}
              <span
                className={
                  activo ? 'text-brand' : completado ? 'text-ok' : 'text-ink-muted'
                }
              >
                {completado ? '✓ ' : ''}{p.label}
              </span>
            </li>
          )
        })}
      </ol>

      {paso === 'carrito' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section aria-label="Productos en el carrito">
            <h2 className="mb-3 text-lg font-semibold">Revisa tu carrito</h2>
            <ul className="space-y-3">
              {carrito.map((item) => {
                const p = getProducto(item.productoId)
                if (!p) return null
                const unitario = precioUnitario(p.id, item.cantidad)
                return (
                  <li key={p.id}>
                    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl" aria-hidden>{p.imagen}</span>
                        <div>
                          <p className="font-medium leading-tight">{p.nombre}</p>
                          <p className="text-sm text-ink-muted">{p.marca} · {p.presentacion}</p>
                          <p className="text-sm">{formatSoles(unitario)} c/u</p>
                          {p.precioVolumen && unitario === p.precioVolumen && (
                            <Badge tono="ok">Precio por volumen</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Quitar una unidad de ${p.nombre}`}
                            onClick={() => cambiarCantidad(p.id, item.cantidad - 1)}
                            className="size-8 rounded-md border border-line text-lg leading-none hover:border-ink-muted"
                          >-</button>
                          <span className="w-6 text-center font-medium">{item.cantidad}</span>
                          <button
                            type="button"
                            aria-label={`Agregar una unidad de ${p.nombre}`}
                            onClick={() => cambiarCantidad(p.id, item.cantidad + 1)}
                            className="size-8 rounded-md border border-line text-lg leading-none hover:border-ink-muted"
                          >+</button>
                        </div>
                        <span className="w-20 text-right text-sm font-semibold">
                          {formatSoles(unitario * item.cantidad)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Quitar ${p.nombre} del carrito`}
                          onClick={() => quitarDelCarrito(p.id)}
                          className="text-bad opacity-70 hover:opacity-100"
                        >x</button>
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
          </section>

          <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-20 lg:self-start">
            <Card>
              <h2 className="text-lg font-semibold">Resumen</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {carrito.map((item) => {
                  const p = getProducto(item.productoId)
                  if (!p) return null
                  return (
                    <li key={p.id} className="flex justify-between text-ink-muted">
                      <span>{item.cantidad}x {p.nombre}</span>
                      <span>{formatSoles(precioUnitario(p.id, item.cantidad) * item.cantidad)}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">{formatSoles(total)}</span>
              </div>
              {tienda && (
                <div className="mt-3 rounded-lg bg-brand-soft p-3 text-sm text-brand-dark">
                  <p className="font-medium">Sin Pide y recoge</p>
                  <p>Esperarías ~{tienda.esperaCajaMin} min en caja en hora punta.</p>
                  <p className="mt-1">Con tu pedido anticipado, recoges en solo ~{RECOJO_MIN} min.</p>
                </div>
              )}
              <Button className="mt-4 w-full" onClick={irAPago}>
                Elegir franja y pagar
              </Button>
              <Link to="/catalogo" className="mt-2 block text-center text-sm text-brand hover:underline">
                Seguir comprando
              </Link>
            </Card>
          </aside>
        </div>
      )}

      {paso === 'pago' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <section aria-labelledby="h-franja">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="h-franja" className="text-lg font-semibold">¿Cuándo recoges?</h2>
                {tienda && (
                  <span className="text-xs text-ink-muted">
                    Horario de atención: <strong className="font-medium text-ink">{tienda.horario}</strong>
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm text-ink-muted">
                {cerradoHoy
                  ? `La tienda ya cerró por hoy (atendió hasta las ${horario.cierreTexto}). Elige una franja para recoger mañana:`
                  : esParaManana
                  ? 'Ya no hay franjas disponibles para hoy dentro del horario de atención. Elige tu recojo para mañana:'
                  : 'Elige una franja de 30 minutos dentro del horario de la tienda. Tu pedido te esperará listo en el mostrador.'}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {franjas.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={franja === f}
                    onClick={() => setFranja(f)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                      franja === f
                        ? 'border-brand bg-brand text-white'
                        : 'border-line bg-surface hover:border-brand'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="h-metodo">
              <h2 id="h-metodo" className="mb-3 text-lg font-semibold">¿Cómo pagas?</h2>
              <div className="space-y-3">
                {METODOS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={metodo === m.id}
                    onClick={() => setMetodo(m.id)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                      metodo === m.id
                        ? 'border-brand bg-brand-soft'
                        : 'border-line bg-surface hover:border-brand'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>{m.icono}</span>
                    <div className="flex-1">
                      <p className="font-medium">{m.etiqueta}</p>
                      <p className="text-sm text-ink-muted">{m.descripcion}</p>
                    </div>
                    {metodo === m.id && (
                      <span className="font-bold text-brand" aria-hidden>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {errorForm && (
              <p role="alert" className="text-sm text-bad">{errorForm}</p>
            )}
          </div>

          <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-20 lg:self-start">
            <Card>
              <h2 className="text-lg font-semibold">Tu pedido</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
                {carrito.map((item) => {
                  const p = getProducto(item.productoId)
                  if (!p) return null
                  return (
                    <li key={p.id} className="flex justify-between">
                      <span>{item.cantidad}x {p.nombre}</span>
                      <span>{formatSoles(precioUnitario(p.id, item.cantidad) * item.cantidad)}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">{formatSoles(total)}</span>
              </div>
              {franja && (
                <p className="mt-3 text-sm text-ink-muted">
                  Recojo: <span className="font-medium text-ink">{franja}</span>
                </p>
              )}
              <Button className="mt-4 w-full" onClick={irAQrOConfirmar}>
                {metodo === 'qr' ? 'Ver QR de pago' : 'Confirmar pedido'}
              </Button>
              <button
                type="button"
                onClick={() => setPaso('carrito')}
                className="mt-2 block w-full text-center text-sm text-brand hover:underline"
              >
                Volver al carrito
              </button>
            </Card>
          </aside>
        </div>
      )}

      {paso === 'qr' && (
        <div className="mx-auto max-w-sm">
          <Card className="text-center">
            <p className="font-semibold">Escanea este QR con Yape, Plin o tu app bancaria</p>
            <p className="mt-1 text-sm text-ink-muted">No cierres esta pantalla hasta confirmar el pago.</p>

            <div className="mx-auto my-6 flex size-52 items-center justify-center rounded-2xl border-4 border-brand bg-white p-4">
              <CodigoQr codigo={codigoQr} className="size-44" etiqueta="Código QR de pago simulado" />
            </div>

            <p className="font-mono text-xl font-bold tracking-widest text-brand-dark">{codigoQr}</p>
            <p className="mt-1 text-sm text-ink-muted">
              Total: <span className="font-semibold text-ink">{formatSoles(total)}</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">{tienda?.nombre}</p>

            <div className="mt-4 rounded-lg bg-canvas p-3 text-left text-sm">
              <p className="mb-1 font-medium">Recojo: {franja}</p>
              <ul className="space-y-0.5 text-ink-muted">
                {carrito.map((item) => {
                  const p = getProducto(item.productoId)
                  if (!p) return null
                  return <li key={p.id}>{item.cantidad}x {p.nombre}</li>
                })}
              </ul>
            </div>

            <Button
              className="mt-6 w-full"
              onClick={simularPagoQr}
              disabled={pagando}
            >
              {pagando ? 'Procesando...' : 'Simular pago realizado'}
            </Button>
            <button
              type="button"
              onClick={() => setPaso('pago')}
              disabled={pagando}
              className="mt-3 block w-full text-center text-sm text-brand hover:underline disabled:opacity-50"
            >
              Volver
            </button>
            <p className="mt-4 text-xs text-ink-muted">
              Prototipo académico · Pago simulado, sin transacción real
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
