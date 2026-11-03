import { useState } from 'react'
import { Link } from 'react-router-dom'
import AvisoWhatsapp from '@/components/AvisoWhatsapp'
import CodigoQr from '@/components/CodigoQr'
import Icono, { type NombreIcono } from '@/components/Icono'
import { Badge, Button, Card, PageHeader, SectionHeader } from '@/components/ui'
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
  type AlertaStock,
} from './datos'

// Responsable: Edison Rosales · rama feat/panel
// Lee: pedidos, encuestas, tiendaId (useApp), stock y tiendas (@/data/tiendas)
// Escribe: avanzarPedido, cancelarPedido, setTienda, cargarDemo (simula el back-stage de la tienda)
// Asistente IA: simulado en el frontend (reglas o respuestas preparadas). Nunca pongas claves de API en el código.
const moduloPanel = getModulo('panel')

const columnas: {
  estado: EstadoPedido
  titulo: string
  icono: NombreIcono
  etapaBlueprint: string
  siguiente?: string
}[] = [
  { estado: 'recibido', titulo: 'Recibidos', icono: 'carrito', etapaBlueprint: 'Orden entrante (QR/App)', siguiente: 'Empezar a preparar' },
  { estado: 'preparando', titulo: 'Preparando', icono: 'caja', etapaBlueprint: 'Back-stage: picking en tienda', siguiente: 'Marcar listo' },
  { estado: 'listo', titulo: 'Listos en mostrador', icono: 'reloj', etapaBlueprint: 'Línea de visibilidad: aviso WhatsApp', siguiente: 'Entregar al cliente' },
  { estado: 'recogido', titulo: 'Recogidos', icono: 'check', etapaBlueprint: 'Front-stage: entrega en 2 min' },
]

const pasosPresentacion = [
  {
    id: 'h-kpis',
    titulo: '1. Dolor y KPIs',
    guion: 'Mostramos el dolor (atención desigual y quiebres sin aviso) y comparamos los 14 min de cola en caja frente a 2 min en mostrador.',
  },
  {
    id: 'h-cola',
    titulo: '2. Service Blueprint',
    guion: 'Avanzamos un pedido en el back-stage y vemos cómo dispara al instante el aviso WhatsApp y el QR en el front-stage del cliente.',
  },
  {
    id: 'h-stock',
    titulo: '3. Garantía de stock',
    guion: 'Revisamos los quiebres y productos de marca propia o formato bodeguero antes de que el cliente encuentre la góndola vacía.',
  },
  {
    id: 'h-ia',
    titulo: '4. Copiloto IA',
    guion: 'Consultamos al asistente IA qué priorizar, si abrir otra caja en hora punta y qué datos en vivo sustentan su recomendación.',
  },
  {
    id: 'h-comp',
    titulo: '5. Antes vs. Después',
    guion: 'Cerramos con el impacto en KPIs, Garantía, Service Blueprint, 7P y fidelización (NPS).',
  },
] as const

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
    cargarDemo,
  } = useApp()
  const tienda = getTienda(tiendaId)

  const [reposicionPedida, setReposicionPedida] = useState<Record<string, boolean>>({})
  const [filtroStock, setFiltroStock] = useState<'todos' | 'quiebres' | 'bajos'>('todos')
  const [ultimoAviso, setUltimoAviso] = useState<{
    titulo: string
    whatsapp?: { mensaje: string; hora?: number }
  } | null>(null)
  const [qrAbiertoId, setQrAbiertoId] = useState<string | null>(null)
  const [modoPresentacion, setModoPresentacion] = useState(false)
  const [pasoActivo, setPasoActivo] = useState(0)

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
        setUltimoAviso({
          titulo: `Pedido ${pedidoId} pasó a «${sig.toUpperCase()}» en el back-stage.`,
          whatsapp: { mensaje: `Pedido ${pedidoId}: ${avisoFrontStage[sig]}` },
        })
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
      setUltimoAviso({
        titulo: `Pedido simulado ${nuevo.id} creado en ${tienda?.nombre ?? 'la tienda'} (${formatSoles(nuevo.total)}).`,
        whatsapp: { mensaje: `Pedido ${nuevo.id}: ${avisoFrontStage.recibido}`, hora: nuevo.creadoEn },
      })
    }
  }

  const marcarReposicion = (productoId: string, nombre: string) => {
    setReposicionPedida((prev) => ({ ...prev, [productoId]: true }))
    setUltimoAviso({
      titulo: `Orden interna enviada a trastienda para reponer: ${nombre}.`,
    })
  }

  const irAPaso = (index: number) => {
    setPasoActivo(index)
    const destino = pasosPresentacion[index]
    if (destino) {
      document.getElementById(destino.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-12">
      <PageHeader
        titulo="Panel de tienda y"
        resaltado="asistente IA"
        descripcion={`Back-stage operativo de ${tienda?.nombre ?? 'la tienda'}: gestiona la cola por franja, anticipa quiebres y decide con el copiloto IA en hora punta.`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
            <Icono nombre="ubicacion" className="size-4 text-brand" />
            <label htmlFor="selector-tienda-panel" className="sr-only">
              Sede activa
            </label>
            <select
              id="selector-tienda-panel"
              value={tiendaId}
              onChange={(e) => {
                setTienda(e.target.value)
                setUltimoAviso(null)
              }}
              className="bg-transparent font-semibold text-ink focus:outline-none"
            >
              {tiendas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} ({t.distrito} · {t.esperaCajaMin} min)
                </option>
              ))}
            </select>
          </span>
          <Badge tono="brand">{tienda?.horario}</Badge>
          <Button
            variante={modoPresentacion ? 'primary' : 'secondary'}
            className="!px-3.5 !py-1.5 text-xs"
            onClick={() => setModoPresentacion((v) => !v)}
          >
            {modoPresentacion ? 'Cerrar guía de exposición' : 'Modo presentación'}
          </Button>
        </div>
      </PageHeader>

      {modoPresentacion && (
        <Card className="border-accent bg-accent-soft/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge tono="brand">Recorrido guiado para la exposición</Badge>
              <span className="text-xs font-medium text-ink-muted">
                Paso {pasoActivo + 1} de {pasosPresentacion.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variante="secondary"
                className="!px-3 !py-1 text-xs"
                onClick={() => {
                  cargarDemo()
                  setUltimoAviso({ titulo: 'Datos de demostración cargados en todas las tiendas.' })
                }}
              >
                Cargar datos de demo
              </Button>
              <Button
                variante="secondary"
                className="!px-3 !py-1 text-xs"
                disabled={pasoActivo === 0}
                onClick={() => irAPaso(Math.max(0, pasoActivo - 1))}
              >
                Anterior
              </Button>
              <Button
                variante="primary"
                className="!px-3.5 !py-1 text-xs"
                onClick={() => irAPaso((pasoActivo + 1) % pasosPresentacion.length)}
              >
                Siguiente punto <Icono nombre="flecha" className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pasosPresentacion.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => irAPaso(i)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  pasoActivo === i ? 'bg-accent text-white' : 'bg-surface text-ink-muted hover:text-ink'
                }`}
              >
                {p.titulo}
              </button>
            ))}
          </div>
          <p className="mt-3 rounded-xl bg-surface p-3 text-sm font-medium text-ink">
            {pasosPresentacion[pasoActivo].guion}
          </p>
        </Card>
      )}

      <div id="h-kpis" className="scroll-mt-24">
        <Card className="border-brand/30 bg-brand-soft/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tono="brand">Dolor que resuelve</Badge>
                <Badge tono="neutral">Service Blueprint · Back-stage y Front-stage</Badge>
                <Badge tono="neutral">Utilidad y Garantía</Badge>
              </div>
              <p className="mt-2 text-lg font-extrabold text-brand-dark">«{moduloPanel.dolor}»</p>
              <p className="mt-1 text-sm text-ink-muted">
                Transformamos una operación reactiva en hora punta en un flujo predecible: el personal prepara pedidos según la franja de recojo y el copiloto IA alerta antes de que el cliente encuentre la góndola vacía.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variante="primary" className="!px-4 !py-2 text-xs" onClick={simularPedidoDemo}>
                <Icono nombre="mas" className="size-4" /> Simular pedido en cola
              </Button>
              {deTienda.length === 0 && (
                <Button variante="secondary" className="!px-4 !py-2 text-xs" onClick={cargarDemo}>
                  Cargar pedidos de ejemplo
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {ultimoAviso && (
        <Card className="border-brand bg-surface">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand">
                  <Icono nombre="check" className="size-4" />
                </span>
                <p className="text-sm font-bold text-ink">{ultimoAviso.titulo}</p>
              </div>
              {ultimoAviso.whatsapp && (
                <AvisoWhatsapp
                  mensaje={ultimoAviso.whatsapp.mensaje}
                  hora={ultimoAviso.whatsapp.hora}
                  titulo="Así le llega el aviso automático al WhatsApp del cliente (Front-stage):"
                />
              )}
            </div>
            <Button variante="ghost" className="!px-3 !py-1 text-xs" onClick={() => setUltimoAviso(null)}>
              Cerrar aviso
            </Button>
          </div>
        </Card>
      )}

      <section aria-label="Indicadores clave (KPIs)" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icono="reloj"
          etiqueta="Tiempo en cola (KPI)"
          valor={`${espera} min`}
          nota={`Caja tradicional vs. ${RECOJO_MIN} min en mostrador Pide y recoge (ahorras ${Math.max(espera - RECOJO_MIN, 0)} min)`}
          alerta={espera >= 12 ? 'bad' : espera >= 9 ? 'warn' : 'ok'}
          badgeTexto={espera >= 12 ? 'Hora punta crítica' : 'Flujo controlado'}
        />
        <Kpi
          icono="caja"
          etiqueta="Pedidos hoy en tienda"
          valor={String(hoy.length)}
          nota={`${deTienda.length} acumulados · ${deTienda.filter((p) => p.estado !== 'recogido').length} activos en back-stage`}
          alerta="ok"
          badgeTexto="Capacidad"
        />
        <Kpi
          icono="usuario"
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
          icono="etiqueta"
          etiqueta="Tasa de recompra"
          valor={recompra === null ? '—' : `${recompra} %`}
          nota={recompra === null ? 'Se calcula desde 2 pedidos' : 'Clientes que repiten canasta básica'}
          alerta="ok"
          badgeTexto="Fidelización"
        />
      </section>

      <section aria-labelledby="h-cola" className="rounded-3xl bg-puntos p-5 sm:p-8">
        <SectionHeader
          id="h-cola"
          titulo="Cola de pedidos en"
          resaltado="tiempo real"
          descripcion="Service Blueprint: cada avance en el back-stage actualiza el seguimiento del cliente y envía un aviso por WhatsApp."
        >
          <Link to="/seguimiento" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline">
            Ver pantalla del cliente (Front-stage) <Icono nombre="flecha" className="size-3.5" />
          </Link>
        </SectionHeader>

        {deTienda.length === 0 ? (
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">Aún no hay pedidos en {tienda?.nombre ?? 'esta tienda'}.</p>
              <p className="mt-1 text-sm text-ink-muted">
                Carga los pedidos de demostración o simula uno nuevo para mostrar el flujo en vivo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={simularPedidoDemo}>
                <Icono nombre="mas" className="size-4" /> Simular pedido ahora
              </Button>
              <Button variante="secondary" onClick={cargarDemo}>
                Cargar demo completa
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columnas.map((c) => {
              const lista = [...deTienda]
                .filter((p) => p.estado === c.estado)
                .sort((a, b) => a.franja.localeCompare(b.franja))
              return (
                <div key={c.estado} className="flex flex-col rounded-2xl border border-line bg-surface/90 p-3.5 shadow-sm">
                  <div className="mb-3 border-b border-line pb-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand">
                          <Icono nombre={c.icono} className="size-4" />
                        </span>
                        <h3 className="text-sm font-bold">{c.titulo}</h3>
                      </div>
                      <Badge tono={c.estado === 'listo' ? 'warn' : c.estado === 'recogido' ? 'ok' : 'brand'}>
                        {lista.length}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">{c.etapaBlueprint}</p>
                  </div>

                  <ul className="space-y-3">
                    {lista.map((p) => {
                      const mostrarQr = qrAbiertoId === p.id
                      return (
                        <li
                          key={p.id}
                          className="rounded-2xl border border-line bg-surface p-3.5 text-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-brand-dark">{p.id}</span>
                            <span className="font-extrabold text-ink">{formatSoles(p.total)}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                            <Badge tono="neutral">Franja {p.franja}</Badge>
                            <Badge tono="brand">{etiquetaMetodoPago[p.metodoPago]}</Badge>
                            <span>· {formatHora(p.creadoEn)}</span>
                          </div>
                          <p className="mt-2 text-xs text-ink">
                            {p.items.map((i) => `${i.cantidad}× ${nombreProducto(i.productoId)}`).join(', ')}
                          </p>

                          {(p.estado === 'listo' || p.estado === 'recogido') && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setQrAbiertoId(mostrarQr ? null : p.id)}
                                className="text-xs font-semibold text-accent hover:underline"
                              >
                                {mostrarQr ? 'Ocultar QR de mostrador' : 'Ver QR de recojo del cliente'}
                              </button>
                              {mostrarQr && (
                                <div className="mt-2 flex flex-col items-center rounded-xl bg-canvas p-2.5 text-center">
                                  <CodigoQr codigo={p.id} activo={p.estado === 'listo'} className="size-24" />
                                  <span className="mt-1 font-mono text-[11px] font-bold">{p.id}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {c.siguiente && (
                            <div className="mt-3 space-y-1.5">
                              <Button className="w-full !py-2 text-xs" onClick={() => manejarAvanzar(p.id)}>
                                {c.siguiente} <Icono nombre="flecha" className="size-3.5" />
                              </Button>
                              {p.estado === 'recibido' && (
                                <button
                                  type="button"
                                  onClick={() => cancelarPedido(p.id)}
                                  className="w-full text-center text-xs font-medium text-ink-muted hover:text-bad"
                                >
                                  Cancelar pedido
                                </button>
                              )}
                            </div>
                          )}
                        </li>
                      )
                    })}
                    {lista.length === 0 && (
                      <li className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-ink-muted">
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

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="h-stock" className="flex flex-col">
          <SectionHeader
            id="h-stock"
            titulo="Alertas de"
            resaltado="stock"
            descripcion={`Garantía de disponibilidad en ${tienda?.nombre ?? 'tienda'}: ${quiebresCount} en quiebre y ${alertas.length - quiebresCount} con stock bajo.`}
          >
            <div className="flex flex-wrap gap-1.5">
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
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    filtroStock === f.id
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-surface text-ink-muted hover:border-ink-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </SectionHeader>

          <Card className="flex-1 p-0 overflow-hidden">
            <ul className="divide-y divide-line">
              {alertasFiltradas.map((a) => {
                const pedida = Boolean(reposicionPedida[a.productoId])
                return (
                  <li
                    key={a.productoId}
                    className="group flex flex-wrap items-center justify-between gap-3 p-3.5 text-sm transition-colors hover:bg-canvas/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <MiniaturaAlerta alerta={a} />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{a.nombre}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                          <span>{a.marca}</span>
                          {a.marcaPropia && <Badge tono="brand">Marca propia</Badge>}
                          {a.esVolumen && <Badge tono="neutral">Formato bodeguero</Badge>}
                        </div>
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
                          className="!px-3 !py-1 text-xs"
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
                <li className="p-5 text-sm text-ink-muted">
                  Sin alertas en este filtro: el stock de la tienda cubre la demanda actual.
                </li>
              )}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="h-ia" className="flex flex-col">
          <SectionHeader
            id="h-ia"
            titulo="Asistente"
            resaltado="IA"
            descripcion="Transformación del proceso crítico: sugiere abrir caja, qué reponer y qué pedido priorizar."
          />
          <Asistente tiendaId={tiendaId} pedidos={deTienda} nps={nps} onAvanzarPrioritario={manejarAvanzar} />
        </section>
      </div>

      <section aria-labelledby="h-voc">
        <SectionHeader
          id="h-voc"
          titulo="Voz del"
          resaltado="cliente (NPS)"
          descripcion="Calificaciones y comentarios reales sincronizados desde el Club 3A y el cierre de recojo."
        >
          <Link to="/club" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline">
            Ir a encuesta NPS en Club 3A <Icono nombre="flecha" className="size-3.5" />
          </Link>
        </SectionHeader>
        {encuestasTienda.length === 0 ? (
          <Card className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-muted">
              Aún no hay respuestas NPS en {tienda?.nombre ?? 'esta sede'}. Carga los datos de demostración o envía una encuesta desde Club 3A.
            </p>
            <Button variante="secondary" className="!px-4 !py-2 text-xs" onClick={cargarDemo}>
              Cargar opiniones de ejemplo
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {encuestasTienda
              .slice(-6)
              .reverse()
              .map((e, idx) => {
                const tipo = e.puntaje >= 9 ? 'Promotor' : e.puntaje >= 7 ? 'Pasivo' : 'Detractor'
                const tono = e.puntaje >= 9 ? 'ok' : e.puntaje >= 7 ? 'warn' : 'bad'
                return (
                  <Card
                    key={`${e.fecha}-${idx}`}
                    className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <Badge tono={tono}>
                        Nota {e.puntaje}/10 · {tipo}
                      </Badge>
                      <span className="text-xs text-ink-muted">{formatFecha(e.fecha)}</span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-ink">
                      {e.comentario ? `«${e.comentario}»` : 'Cliente calificó la experiencia sin dejar comentario adicional.'}
                    </p>
                  </Card>
                )
              })}
          </div>
        )}
      </section>

      <section aria-labelledby="h-comp">
        <SectionHeader
          id="h-comp"
          centrado
          titulo="Antes y después de"
          resaltado="Pide y recoge"
          descripcion={`Resumen ejecutivo para la sustentación: impacto en ${tienda?.nombre ?? 'la tienda'} según los conceptos de Ingeniería de Sistemas de Servicio.`}
        />
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[38rem] text-sm">
            <thead className="bg-brand-soft/70 text-left text-ink">
              <tr>
                <th className="p-3.5 font-bold">Dimensión / Concepto</th>
                <th className="p-3.5 font-bold">Indicador</th>
                <th className="p-3.5 font-bold">Antes (compra tradicional)</th>
                <th className="p-3.5 font-bold">Después (Pide y recoge + IA)</th>
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
        <p className="mt-2 text-center text-xs text-ink-muted">
          Cifras simuladas en tiempo real para la presentación académica; cambia de sede arriba para comparar tiempos de espera y quiebres por distrito.
        </p>
      </section>
    </div>
  )
}

function MiniaturaAlerta({ alerta }: { alerta: AlertaStock }) {
  const [falloFoto, setFalloFoto] = useState(false)
  if (alerta.foto && !falloFoto) {
    return (
      <img
        src={alerta.foto}
        alt={alerta.nombre}
        loading="lazy"
        onError={() => setFalloFoto(true)}
        className="size-11 shrink-0 rounded-full border-2 border-white bg-canvas object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
      />
    )
  }
  return (
    <span
      className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-white bg-canvas text-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
      aria-hidden
    >
      {alerta.imagen}
    </span>
  )
}

function Kpi({
  icono,
  etiqueta,
  valor,
  nota,
  alerta,
  badgeTexto,
}: {
  icono: NombreIcono
  etiqueta: string
  valor: string
  nota: string
  alerta: 'ok' | 'warn' | 'bad' | 'neutral'
  badgeTexto: string
}) {
  return (
    <Card className="flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
            <Icono nombre={icono} className="size-4" />
          </span>
          <p className="text-sm font-bold text-ink">{etiqueta}</p>
        </div>
        <Badge tono={alerta}>{badgeTexto}</Badge>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-brand">{valor}</p>
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
    <tr className="transition-colors hover:bg-canvas/50">
      <td className="p-3.5">
        <Badge tono="brand">{concepto}</Badge>
      </td>
      <td className="p-3.5 font-bold text-ink">{indicador}</td>
      <td className="p-3.5 text-ink-muted">{antes}</td>
      <td className="p-3.5 font-semibold text-ok">{despues}</td>
    </tr>
  )
}


