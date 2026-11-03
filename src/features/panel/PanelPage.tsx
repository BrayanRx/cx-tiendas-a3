import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { getModulo } from '@/config/equipo'
import { getTienda, tiendas } from '@/data/tiendas'
import { formatFecha, formatHora, formatSoles } from '@/lib/format'
import { useApp } from '@/lib/store'
import type { EstadoPedido } from '@/lib/types'
import Asistente from './Asistente'
import {
  alertasStock,
  avisoFrontStage,
  calcularNps,
  calcularRecompra,
  desgloseNps,
  esperaCaja,
  etiquetaMetodoPago,
  nombreProducto,
  pedidosDeHoy,
  RECOJO_MIN,
} from './datos'

// Responsable: Edison Rosales · rama feat/panel
// Lee: pedidos, encuestas, tiendaId (useApp), stock y tiendas (@/data/tiendas)
// Escribe: avanzarPedido, cancelarPedido, setTienda (simula el back-stage de la tienda)
// Asistente IA: simulado en el frontend (reglas o respuestas preparadas). Nunca pongas claves de API en el código.
const moduloPanel = getModulo('panel')

const columnas: { estado: EstadoPedido; titulo: string; etapaBlueprint: string; siguiente?: string }[] = [
  { estado: 'recibido', titulo: 'Recibidos', etapaBlueprint: 'Orden entrante (QR/App)', siguiente: 'Empezar a preparar' },
  { estado: 'preparando', titulo: 'Preparando', etapaBlueprint: 'Back-stage: picking en tienda', siguiente: 'Marcar listo' },
  { estado: 'listo', titulo: 'Listos en mostrador', etapaBlueprint: 'Línea de visibilidad: aviso WhatsApp', siguiente: 'Entregar al cliente' },
  { estado: 'recogido', titulo: 'Recogidos', etapaBlueprint: 'Front-stage: entrega en 2 min' },
]

export default function PanelPage() {
  const {
    tiendaId,
    setTienda,
    pedidos,
    encuestas,
    avanzarPedido,
    cancelarPedido,
    carrito,
    vaciarCarrito,
    agregarAlCarrito,
    crearPedido,
  } = useApp()
  const tienda = getTienda(tiendaId)

  const [reposicionPedida, setReposicionPedida] = useState<Record<string, boolean>>({})
  const [filtroStock, setFiltroStock] = useState<'todos' | 'quiebres' | 'bajos'>('todos')
  const [ultimoAviso, setUltimoAviso] = useState<string | null>(null)

  const deTienda = pedidos.filter((p) => p.tiendaId === tiendaId && p.estado !== 'cancelado')
  const hoy = pedidosDeHoy(deTienda)
  const encuestasTienda = encuestas.filter((e) => e.tiendaId === tiendaId)
  const nps = calcularNps(encuestasTienda)
  const resumenNps = desgloseNps(encuestasTienda)
  const recompra = calcularRecompra(deTienda)
  const alertas = alertasStock(tiendaId)
  const quiebresCount = alertas.filter((a) => a.unidades === 0).length
  const espera = esperaCaja(tiendaId)

  const alertasFiltradas = alertas.filter((a) => {
    if (filtroStock === 'quiebres') return a.unidades === 0
    if (filtroStock === 'bajos') return a.unidades > 0
    return true
  })

  const manejarAvanzar = (pedidoId: string) => {
    const actual = deTienda.find((p) => p.id === pedidoId)
    avanzarPedido(pedidoId)
    if (actual) {
      const orden: EstadoPedido[] = ['recibido', 'preparando', 'listo', 'recogido']
      const sig = orden[orden.indexOf(actual.estado) + 1]
      if (sig) {
        setUltimoAviso(`Pedido ${pedidoId} → ${sig.toUpperCase()}. ${avisoFrontStage[sig]}`)
      }
    }
  }

  const simularPedidoDemo = () => {
    const previo = [...carrito]
    vaciarCarrito()
    agregarAlCarrito('arroz-5kg', 1)
    agregarAlCarrito('aceite-1l', 2)
    agregarAlCarrito('leche-400', 3)
    const nuevo = crearPedido({ franja: '18:00 – 18:30', metodoPago: 'qr' })
    previo.forEach((i) => agregarAlCarrito(i.productoId, i.cantidad))
    if (nuevo) {
      setUltimoAviso(`Pedido simulado ${nuevo.id} creado en ${tienda?.nombre ?? 'la tienda'} (${formatSoles(nuevo.total)}).`)
    }
  }

  const marcarReposicion = (productoId: string, nombre: string) => {
    setReposicionPedida((prev) => ({ ...prev, [productoId]: true }))
    setUltimoAviso(`Orden interna enviada a trastienda para reponer: ${nombre}.`)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        titulo="Panel de tienda y asistente IA"
        descripcion={`Back-stage operativo de ${tienda?.nombre ?? 'la tienda'}: gestiona la cola por franja, anticipa quiebres y toma decisiones en hora punta.`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="selector-tienda-panel" className="text-xs font-medium text-ink-muted">
            Sede activa:
          </label>
          <select
            id="selector-tienda-panel"
            value={tiendaId}
            onChange={(e) => {
              setTienda(e.target.value)
              setUltimoAviso(null)
            }}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink"
          >
            {tiendas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} ({t.distrito} · cola {t.esperaCajaMin} min)
              </option>
            ))}
          </select>
          <Badge tono="brand">{tienda?.horario}</Badge>
        </div>
      </PageHeader>

      <Card className="border-brand bg-brand-soft/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tono="brand">Dolor que resuelve</Badge>
              <Badge tono="neutral">Service Blueprint · Back-stage → Front-stage</Badge>
              <Badge tono="neutral">Utilidad y Garantía</Badge>
            </div>
            <p className="mt-2 font-semibold text-brand-dark">«{moduloPanel.dolor}»</p>
            <p className="mt-0.5 text-sm text-ink-muted">
              Transformamos una operación reactiva en hora punta en un flujo predecible: el personal prepara pedidos según la franja de recojo y el copiloto IA alerta antes de que el cliente encuentre la góndola vacía.
            </p>
          </div>
          <Button variante="secondary" className="!py-2 text-xs" onClick={simularPedidoDemo}>
            + Simular pedido en cola
          </Button>
        </div>
      </Card>

      {ultimoAviso && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand bg-brand-soft px-4 py-3 text-sm text-brand-dark"
        >
          <span>{ultimoAviso}</span>
          <button type="button" onClick={() => setUltimoAviso(null)} className="text-xs font-medium underline">
            Ocultar
          </button>
        </div>
      )}

      <section aria-label="Indicadores clave (KPIs)" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          etiqueta="Tiempo en cola (KPI)"
          valor={`${espera} min`}
          nota={`Caja tradicional vs. ${RECOJO_MIN} min en mostrador Pide y recoge (ahorro: ${Math.max(espera - RECOJO_MIN, 0)} min)`}
          alerta={espera >= 12 ? 'bad' : espera >= 9 ? 'warn' : 'ok'}
          badgeTexto={espera >= 12 ? 'Hora punta crítica' : 'Flujo normal'}
        />
        <Kpi
          etiqueta="Pedidos hoy en tienda"
          valor={String(hoy.length)}
          nota={`${deTienda.length} acumulados · ${deTienda.filter((p) => p.estado !== 'recogido').length} activos en back-stage`}
          alerta="ok"
          badgeTexto="Capacidad"
        />
        <Kpi
          etiqueta="NPS de la sede"
          valor={nps === null ? '—' : String(nps)}
          nota={
            nps === null
              ? 'Sin encuestas aún en esta sede'
              : `${resumenNps.promotores} prom. · ${resumenNps.pasivos} pas. · ${resumenNps.detractores} detr.`
          }
          alerta={nps === null ? 'neutral' : nps >= 50 ? 'ok' : nps >= 0 ? 'warn' : 'bad'}
          badgeTexto="Voz del cliente"
        />
        <Kpi
          etiqueta="Tasa de recompra"
          valor={recompra === null ? '—' : `${recompra} %`}
          nota={recompra === null ? 'Se calcula desde 2 pedidos' : 'Clientes que repiten canasta básica'}
          alerta="ok"
          badgeTexto="Fidelización"
        />
      </section>

      <section aria-labelledby="h-cola">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="h-cola" className="text-xl font-semibold">
              Cola de pedidos en tiempo real (Service Blueprint)
            </h2>
            <p className="text-sm text-ink-muted">
              Cada avance en el back-stage dispara un aviso automático al WhatsApp del cliente en el front-stage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/seguimiento" className="text-xs font-medium text-brand hover:underline">
              Ver pantalla del cliente (Front-stage) →
            </Link>
          </div>
        </div>

        {deTienda.length === 0 ? (
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">Aún no hay pedidos en {tienda?.nombre ?? 'esta tienda'}.</p>
              <p className="mt-1 text-sm text-ink-muted">
                Puedes armar uno desde el catálogo o generar un pedido de demostración para probar el flujo en vivo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={simularPedidoDemo}>Cargar pedido de prueba</Button>
              <Link to="/catalogo">
                <Button variante="secondary">Ir al catálogo</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columnas.map((c) => {
              const lista = [...deTienda]
                .filter((p) => p.estado === c.estado)
                .sort((a, b) => a.franja.localeCompare(b.franja))
              return (
                <div key={c.estado} className="flex flex-col rounded-xl border border-line bg-canvas p-3">
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{c.titulo}</h3>
                      <Badge tono={c.estado === 'listo' ? 'warn' : c.estado === 'recogido' ? 'ok' : 'brand'}>
                        {lista.length}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted">{c.etapaBlueprint}</p>
                  </div>

                  <ul className="space-y-2.5">
                    {lista.map((p) => (
                      <li key={p.id} className="rounded-lg border border-line bg-surface p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-brand-dark">{p.id}</span>
                          <span className="font-semibold">{formatSoles(p.total)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                          <Badge tono="neutral">Franja {p.franja}</Badge>
                          <Badge tono="brand">{etiquetaMetodoPago[p.metodoPago]}</Badge>
                          <span>· {formatHora(p.creadoEn)}</span>
                        </div>
                        <p className="mt-2 text-xs text-ink">
                          {p.items.map((i) => `${i.cantidad}× ${nombreProducto(i.productoId)}`).join(', ')}
                        </p>
                        {c.siguiente && (
                          <div className="mt-3 space-y-1.5">
                            <Button className="w-full !py-1.5 text-xs" onClick={() => manejarAvanzar(p.id)}>
                              {c.siguiente} →
                            </Button>
                            {p.estado === 'recibido' && (
                              <button
                                type="button"
                                onClick={() => cancelarPedido(p.id)}
                                className="w-full text-center text-xs text-ink-muted hover:text-bad"
                              >
                                Cancelar pedido
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                    {lista.length === 0 && (
                      <li className="rounded-lg border border-dashed border-line p-4 text-center text-xs text-ink-muted">
                        Sin pedidos en esta etapa
                      </li>
                    )}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="h-stock" className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id="h-stock" className="text-xl font-semibold">
                Alertas de stock en tienda
              </h2>
              <p className="text-xs text-ink-muted">
                Garantía de disponibilidad: evita que el cliente llegue y no encuentre su producto ({quiebresCount} en quiebre).
              </p>
            </div>
            <div className="flex gap-1">
              {(
                [
                  { id: 'todos', label: `Todos (${alertas.length})` },
                  { id: 'quiebres', label: `Quiebres (${quiebresCount})` },
                  { id: 'bajos', label: `Stock bajo (${alertas.length - quiebresCount})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltroStock(f.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    filtroStock === f.id
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-surface text-ink-muted hover:border-ink-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <Card className="flex-1 p-0">
            <ul className="divide-y divide-line">
              {alertasFiltradas.map((a) => {
                const pedida = Boolean(reposicionPedida[a.productoId])
                return (
                  <li key={a.productoId} className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">
                        <span aria-hidden className="mr-1.5">
                          {a.imagen}
                        </span>
                        {a.nombre}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                        <span>{a.marca}</span>
                        {a.marcaPropia && <Badge tono="brand">Marca propia</Badge>}
                        {a.esVolumen && <Badge tono="neutral">Formato bodeguero</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.unidades === 0 ? (
                        <Badge tono="bad">Quiebre (0 unid.)</Badge>
                      ) : (
                        <Badge tono="warn">Quedan {a.unidades}</Badge>
                      )}
                      {pedida ? (
                        <Badge tono="ok">En reposición</Badge>
                      ) : (
                        <Button
                          variante="secondary"
                          className="!px-2.5 !py-1 text-xs"
                          onClick={() => marcarReposicion(a.productoId, a.nombre)}
                        >
                          Reponer
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
              {alertasFiltradas.length === 0 && (
                <li className="p-4 text-sm text-ink-muted">
                  Sin alertas en este filtro: el stock de la tienda cubre la demanda actual.
                </li>
              )}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="h-ia" className="flex flex-col">
          <h2 id="h-ia" className="sr-only">
            Asistente IA
          </h2>
          <Asistente tiendaId={tiendaId} pedidos={deTienda} nps={nps} onAvanzarPrioritario={manejarAvanzar} />
        </section>
      </div>

      <section aria-labelledby="h-voc">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="h-voc" className="text-xl font-semibold">
              Voz del cliente (NPS y comentarios de la sede)
            </h2>
            <p className="text-xs text-ink-muted">
              Conectado en vivo con las encuestas que el cliente responde en el Club 3A o tras recoger su pedido.
            </p>
          </div>
          <Link to="/club" className="text-xs font-medium text-brand hover:underline">
            Ir a encuesta NPS en Club 3A →
          </Link>
        </div>
        {encuestasTienda.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-muted">
              Aún no hay respuestas NPS en {tienda?.nombre ?? 'esta sede'}. Cuando un cliente envíe su calificación en{' '}
              <Link to="/club" className="font-medium text-brand underline">
                Club 3A
              </Link>
              , aparecerá aquí al instante.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {encuestasTienda.slice(-6).reverse().map((e, idx) => {
              const tipo = e.puntaje >= 9 ? 'Promotor' : e.puntaje >= 7 ? 'Pasivo' : 'Detractor'
              const tono = e.puntaje >= 9 ? 'ok' : e.puntaje >= 7 ? 'warn' : 'bad'
              return (
                <Card key={`${e.fecha}-${idx}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge tono={tono}>
                      Nota {e.puntaje}/10 · {tipo}
                    </Badge>
                    <span className="text-xs text-ink-muted">{formatFecha(e.fecha)}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink">
                    {e.comentario ? `«${e.comentario}»` : 'Sin comentario adicional.'}
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="h-comp">
        <h2 id="h-comp" className="mb-1 text-xl font-semibold">
          Impacto en el sistema de servicio: Antes vs. Después
        </h2>
        <p className="mb-3 text-sm text-ink-muted">
          Resumen ejecutivo para la sustentación: cómo «Pide y recoge» + IA transforma el proceso crítico en {tienda?.nombre ?? 'la tienda'}.
        </p>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="bg-canvas text-left text-ink-muted">
              <tr>
                <th className="p-3 font-medium">Dimensión / Concepto</th>
                <th className="p-3 font-medium">Indicador</th>
                <th className="p-3 font-medium">Antes (compra tradicional)</th>
                <th className="p-3 font-medium">Después (Pide y recoge + IA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <Fila
                concepto="KPI de Tiempo"
                indicador="Espera en hora punta"
                antes={`${espera} min haciendo fila en caja`}
                despues={`${RECOJO_MIN} min en mostrador (ahorro de ${Math.max(espera - RECOJO_MIN, 0)} min)`}
              />
              <Fila
                concepto="Garantía (Disponibilidad)"
                indicador="Visibilidad de stock"
                antes="Incierta: descubre el quiebre en el pasillo"
                despues={`Stock en vivo en web + ${quiebresCount} quiebre(s) detectados por IA`}
              />
              <Fila
                concepto="Service Blueprint"
                indicador="Coordinación Back / Front"
                antes="Atención desigual según la fila que toque"
                despues="Cola priorizada por franja de 30 min y aviso WhatsApp"
              />
              <Fila
                concepto="7P (People & Process)"
                indicador="Toma de decisiones en tienda"
                antes="Intuitiva, el cajero se satura en hora punta"
                despues="Copiloto IA sugiere abrir caja y qué marca propia reponer"
              />
              <Fila
                concepto="Utilidad y Fidelización"
                indicador="Relación con el cliente"
                antes="Solo por precio bajo, sin postventa ni voz"
                despues="Barato en precio y en tiempo + puntos Club 3A y NPS en vivo"
              />
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-xs text-ink-muted">
          Cifras simuladas en tiempo real para la presentación académica; cambia de sede arriba para comparar tiempos de espera y quiebres por distrito.
        </p>
      </section>
    </div>
  )
}

function Kpi({
  etiqueta,
  valor,
  nota,
  alerta,
  badgeTexto,
}: {
  etiqueta: string
  valor: string
  nota: string
  alerta: 'ok' | 'warn' | 'bad' | 'neutral'
  badgeTexto: string
}) {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-ink-muted">{etiqueta}</p>
        <Badge tono={alerta}>{badgeTexto}</Badge>
      </div>
      <p className="mt-2 text-3xl font-semibold text-brand-dark">{valor}</p>
      <p className="mt-1 text-xs text-ink-muted">{nota}</p>
    </Card>
  )
}

function Fila({
  concepto,
  indicador,
  antes,
  despues,
}: {
  concepto: string
  indicador: string
  antes: string
  despues: string
}) {
  return (
    <tr>
      <td className="p-3">
        <Badge tono="brand">{concepto}</Badge>
      </td>
      <td className="p-3 font-medium">{indicador}</td>
      <td className="p-3 text-ink-muted">{antes}</td>
      <td className="p-3 font-medium text-ok">{despues}</td>
    </tr>
  )
}

