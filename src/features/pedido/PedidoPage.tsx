import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { getProducto } from '@/data/productos'
import { getTienda } from '@/data/tiendas'
import { formatSoles } from '@/lib/format'
import { precioUnitario, totalItems, useApp } from '@/lib/store'
import type { MetodoPago } from '@/lib/types'

// Responsable: Nicole Auqui - rama feat/pedido
// Dolor que resuelve: colas en caja ("Barato en precio, barato en tiempo")
// Concepto del curso: blueprint front-stage (cliente elige y paga) / back-stage (tienda prepara)
// Lee: carrito, tiendaId (useApp, @/lib/store), esperaCajaMin (tienda)
// Escribe: cambiarCantidad, quitarDelCarrito, crearPedido -> navega a /seguimiento/:id

type Paso = 'carrito' | 'pago' | 'qr'

const METODOS: { id: MetodoPago; etiqueta: string; icono: string; descripcion: string }[] = [
  { id: 'qr',               etiqueta: 'Pago QR',           icono: '📱', descripcion: 'Escanea con Yape, Plin o tu app bancaria' },
  { id: 'tarjeta',          etiqueta: 'Tarjeta',            icono: '💳', descripcion: 'Debito o credito al recoger en tienda' },
  { id: 'efectivo-en-tienda', etiqueta: 'Efectivo en tienda', icono: '💵', descripcion: 'Pagas en caja solo al momento de recoger' },
]

function generarFranjas(): string[] {
  const ahora = new Date()
  const minutos = ahora.getMinutes()
  const bloque = Math.ceil((minutos + 1) / 30) * 30
  const base = new Date(ahora)
  base.setMinutes(bloque, 0, 0)
  const fmt = (d: Date) => d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  return Array.from({ length: 6 }, (_, i) => {
    const inicio = new Date(base.getTime() + i * 30 * 60_000)
    const fin   = new Date(inicio.getTime() + 30 * 60_000)
    return `${fmt(inicio)} - ${fmt(fin)}`
  })
}

const PATRON_QR = [
  1,1,1,0,1,1,1,
  1,0,1,0,1,0,1,
  1,1,1,0,1,1,1,
  0,1,0,1,0,1,0,
  1,1,0,0,0,1,1,
  0,0,1,0,1,0,0,
  1,0,1,1,1,0,1,
]

const RECOJO_MIN = 3

export default function PedidoPage() {
  const navigate = useNavigate()
  const { tiendaId, carrito, cambiarCantidad, quitarDelCarrito, crearPedido } = useApp()
  const tienda  = getTienda(tiendaId)
  const franjas = generarFranjas()

  const [paso,      setPaso]     = useState<Paso>('carrito')
  const [franja,    setFranja]   = useState(franjas[0])
  const [metodo,    setMetodo]   = useState<MetodoPago>('qr')
  const [errorForm, setErrorForm] = useState('')
  const [pagando,   setPagando]  = useState(false)
  const [codigoQr]  = useState(() => 'QR-' + Math.random().toString(36).slice(2, 8).toUpperCase())

  const total     = totalItems(carrito)
  const ahorroMin = tienda ? Math.max(tienda.esperaCajaMin - RECOJO_MIN, 0) : 0

  function irAPago() {
    if (!carrito.length) return
    setErrorForm('')
    setPaso('pago')
  }

  function irAQrOConfirmar() {
    if (!franja) { setErrorForm('Elige una franja de recojo.'); return }
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
        <PageHeader titulo="Tu pedido" descripcion="Arma tu canasta desde el catalogo y recoge sin hacer cola." />
        <Card className="py-10 text-center">
          <p className="text-5xl" aria-hidden>🛒</p>
          <p className="mt-3 text-lg font-semibold">Tu carrito esta vacio</p>
          <p className="mt-1 text-sm text-ink-muted">Agrega productos y vuelve aca para pagar.</p>
          <Link
            to="/catalogo"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Ver catalogo
          </Link>
        </Card>
      </div>
    )
  }

  const PASOS: { id: Paso; label: string }[] = [
    { id: 'carrito', label: 'Carrito' },
    { id: 'pago',    label: 'Pago' },
    { id: 'qr',      label: 'Confirmar QR' },
  ]
  const idxActual = PASOS.findIndex((p) => p.id === paso)

  return (
    <div>
      <PageHeader
        titulo="Tu pedido"
        descripcion={`${tienda?.nombre ?? 'Tu tienda'} - ${tienda?.horario ?? ''}`}
      >
        {ahorroMin > 0 && (
          <Badge tono="ok">Ahorras ~{ahorroMin} min frente a la cola</Badge>
        )}
      </PageHeader>

      <ol aria-label="Pasos del pedido" className="mb-6 flex items-center gap-2 text-xs font-medium">
        {PASOS.map((p, i) => {
          const activo     = i === idxActual
          const completado = i < idxActual
          return (
            <li key={p.id} className="flex items-center gap-2">
              {i > 0 && <span className="text-ink-muted" aria-hidden>&rsaquo;</span>}
              <span
                className={
                  activo    ? 'text-brand'    :
                  completado ? 'text-ok'      :
                  'text-ink-muted'
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
                  <p>Esperarias ~{tienda.esperaCajaMin} min en caja en hora punta.</p>
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
              <h2 id="h-franja" className="mb-3 text-lg font-semibold">Cuando recoges?</h2>
              <p className="mb-3 text-sm text-ink-muted">Elige una franja de 30 minutos. Tu pedido te esperara listo en el mostrador.</p>
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
              <h2 id="h-metodo" className="mb-3 text-lg font-semibold">Como pagas?</h2>
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

            <div
              role="img"
              aria-label="Codigo QR de pago simulado"
              className="mx-auto my-6 flex size-52 items-center justify-center rounded-2xl border-4 border-brand bg-white p-4"
            >
              <div className="grid grid-cols-7 gap-1">
                {PATRON_QR.map((celda, i) => (
                  <div
                    key={i}
                    className={`size-4 rounded-sm ${celda ? 'bg-ink' : 'bg-white'}`}
                  />
                ))}
              </div>
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
              Prototipo academico - Pago simulado, sin transaccion real
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}