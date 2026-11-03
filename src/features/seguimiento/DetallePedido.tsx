import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { getProducto } from '@/data/productos'
import { getTienda } from '@/data/tiendas'
import { formatHora, formatSoles } from '@/lib/format'
import { precioUnitario, useApp } from '@/lib/store'
import type { Pedido } from '@/lib/types'
import CodigoQr from './CodigoQr'
import Postventa from './Postventa'
import { PASOS, etiquetaEstado, etiquetaPago, mensajeWhatsapp, tonoEstado } from './datos'

export default function DetallePedido({ pedido }: { pedido: Pedido }) {
  const navigate = useNavigate()
  const avanzarPedido = useApp((s) => s.avanzarPedido)
  const tienda = getTienda(pedido.tiendaId)
  const cancelado = pedido.estado === 'cancelado'
  const actual = PASOS.findIndex((p) => p.estado === pedido.estado)
  const listo = pedido.estado === 'listo'

  const codigoRecojo = (
    <Card className="text-center">
      <h2 className="text-lg font-semibold">Tu código de recojo</h2>
      <div className="mt-3 flex justify-center">
        <CodigoQr codigo={pedido.id} activo={listo} />
      </div>
      <p className="mt-3 font-mono text-2xl font-bold tracking-widest">{pedido.id}</p>
      <p className="mt-1 text-sm text-ink-muted">
        {listo
          ? 'Muéstralo en el mostrador Pide y recoge. No haces fila en caja.'
          : 'Se activa cuando tu pedido esté listo. Te avisamos por WhatsApp.'}
      </p>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/seguimiento" className="text-sm text-brand hover:underline">
          ← Mis pedidos
        </Link>
        <Badge tono={tonoEstado[pedido.estado]}>{etiquetaEstado[pedido.estado]}</Badge>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pedido {pedido.id}</h1>
        <p className="mt-1 text-ink-muted">
          {tienda?.nombre} · {tienda?.direccion} · Recojo {pedido.franja}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {listo && <div className="lg:hidden">{codigoRecojo}</div>}

          {/* Línea de tiempo: lo que pasa en el back-stage, visible para el cliente */}
          <Card>
            <h2 className="mb-4 text-lg font-semibold">¿En qué va mi pedido?</h2>
            {cancelado ? (
              <p className="text-sm text-bad">Este pedido se canceló a las {formatHora(pedido.actualizadoEn)}</p>
            ) : (
              <ol className="space-y-0">
                {PASOS.map((paso, i) => {
                  const hecho = i < actual
                  const ahora = i === actual
                  const hora = i === 0 ? pedido.creadoEn : ahora ? pedido.actualizadoEn : null
                  return (
                    <li key={paso.estado} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                            ahora ? 'bg-brand text-white' : hecho ? 'bg-green-50 text-ok' : 'bg-canvas text-ink-muted'
                          }`}
                          aria-hidden
                        >
                          {hecho ? '✓' : i + 1}
                        </span>
                        {i < PASOS.length - 1 && <span className={`w-0.5 flex-1 ${hecho ? 'bg-ok' : 'bg-line'}`} />}
                      </div>
                      <div className="pb-5">
                        <p className={`font-medium ${ahora ? 'text-brand' : hecho ? 'text-ink' : 'text-ink-muted'}`}>
                          {paso.titulo}
                          {ahora && <span className="sr-only"> (estado actual)</span>}
                        </p>
                        <p className="text-sm text-ink-muted">
                          {paso.detalle}
                          {hora && (ahora || hecho) ? ` · ${formatHora(hora)}` : ''}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
            {!cancelado && pedido.estado !== 'recogido' && (
              <Button variante="ghost" className="mt-1 !px-2 !py-1 text-xs" onClick={() => avanzarPedido(pedido.id)}>
                Simular avance de la tienda (demo)
              </Button>
            )}
          </Card>

          {/* Vista previa del aviso por WhatsApp (no se envía nada) */}
          <section aria-labelledby="h-wsp">
            <h2 id="h-wsp" className="mb-2 text-sm font-medium text-ink-muted">
              Así te avisamos por WhatsApp
            </h2>
            <div className="rounded-xl bg-canvas p-4">
              <div className="max-w-sm rounded-xl rounded-tl-sm border border-line bg-green-50 p-3 text-sm shadow-sm">
                <p className="text-xs font-semibold text-ok">Tiendas 3A · Pide y recoge</p>
                <p className="mt-1 text-ink">{mensajeWhatsapp(pedido)}</p>
                <p className="mt-1 text-right text-xs text-ink-muted">{formatHora(pedido.actualizadoEn)} ✓✓</p>
              </div>
            </div>
          </section>

          {/* Al recoger: cerrar el ciclo con la encuesta NPS del Club */}
          {pedido.estado === 'recogido' && (
            <Card className="border-brand bg-brand-soft">
              <h2 className="text-lg font-semibold">¿Qué tal te fue hoy?</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Ganaste <strong className="text-ink">{pedido.puntosGanados} puntos</strong>. Califícanos del 0 al 10: nos toma un minuto mejorar con tu opinión.
              </p>
              <Button className="mt-3" onClick={() => navigate('/club')}>
            Responder la encuesta
          </Button>
            </Card>
          )}

          <Postventa pedido={pedido} />
        </div>

        <div className="space-y-6">
          {/* Código de recojo: en celular sube arriba cuando ya está listo */}
          {!cancelado && pedido.estado !== 'recogido' && <div className={listo ? 'hidden lg:block' : ''}>{codigoRecojo}</div>}

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Tu compra</h2>
            <ul className="divide-y divide-line text-sm">
              {pedido.items.map((i) => {
                const p = getProducto(i.productoId)
                return (
                  <li key={i.productoId} className="flex justify-between gap-3 py-2">
                    <span>
                      {p?.imagen} {i.cantidad}× {p?.nombre ?? i.productoId}
                    </span>
                    <span className="shrink-0">{formatSoles(precioUnitario(i.productoId, i.cantidad) * i.cantidad)}</span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
              <span>Total</span>
              <span>{formatSoles(pedido.total)}</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">{etiquetaPago[pedido.metodoPago]}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
