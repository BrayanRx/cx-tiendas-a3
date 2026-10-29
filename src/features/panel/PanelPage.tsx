import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { getTienda } from '@/data/tiendas'
import { useApp } from '@/lib/store'
import type { EstadoPedido } from '@/lib/types'
import Asistente from './Asistente'
import { alertasStock, calcularNps, calcularRecompra, esperaCaja, nombreProducto, pedidosDeHoy, RECOJO_MIN } from './datos'

// Responsable: Edison Rosales · rama feat/panel
// Lee: pedidos, encuestas, tiendaId (useApp), stock y tiendas (@/data/tiendas)
// Escribe: avanzarPedido (simula el back-stage de la tienda)
// Asistente IA: simulado en el frontend (reglas o respuestas preparadas). Nunca pongas claves de API en el código.
const columnas: { estado: EstadoPedido; titulo: string; siguiente?: string }[] = [
  { estado: 'recibido', titulo: 'Recibidos', siguiente: 'Empezar a preparar' },
  { estado: 'preparando', titulo: 'Preparando', siguiente: 'Marcar listo' },
  { estado: 'listo', titulo: 'Listos', siguiente: 'Entregado al cliente' },
  { estado: 'recogido', titulo: 'Recogidos' },
]

export default function PanelPage() {
  const { tiendaId, pedidos, encuestas, avanzarPedido } = useApp()
  const tienda = getTienda(tiendaId)

  const deTienda = pedidos.filter((p) => p.tiendaId === tiendaId)
  const hoy = pedidosDeHoy(deTienda)
  const nps = calcularNps(encuestas.filter((e) => e.tiendaId === tiendaId))
  const recompra = calcularRecompra(deTienda.filter((p) => p.estado !== 'cancelado'))
  const alertas = alertasStock(tiendaId)
  const espera = esperaCaja(tiendaId)

  return (
    <div className="space-y-8">
      <PageHeader titulo="Panel de tienda" descripcion={`Back-stage de ${tienda?.nombre ?? 'la tienda'}: atiende pedidos, vigila el stock y decide con ayuda del asistente.`}>
        <Badge tono="brand">{tienda?.distrito}</Badge>
      </PageHeader>

      <section aria-label="Indicadores" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi etiqueta="Tiempo en cola" valor={`${espera} min`} nota={`${RECOJO_MIN} min con Pide y recoge`} />
        <Kpi etiqueta="Pedidos del día" valor={String(hoy.length)} nota={`${deTienda.length} en total`} />
        <Kpi etiqueta="NPS" valor={nps === null ? '—' : String(nps)} nota={nps === null ? 'Sin encuestas aún' : `${encuestas.filter((e) => e.tiendaId === tiendaId).length} respuestas`} />
        <Kpi etiqueta="Recompra" valor={recompra === null ? '—' : `${recompra} %`} nota={recompra === null ? 'Faltan pedidos' : 'Pedidos que repiten producto'} />
      </section>

      <section aria-labelledby="h-cola">
        <h2 id="h-cola" className="mb-3 text-xl font-semibold">
          Cola de pedidos
        </h2>
        {deTienda.length === 0 && (
          <Card>
            <p className="text-sm text-ink-muted">Aún no hay pedidos en esta tienda. Crea uno desde el catálogo para verlo aquí.</p>
          </Card>
        )}
        {deTienda.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columnas.map((c) => {
              const lista = deTienda.filter((p) => p.estado === c.estado)
              return (
                <div key={c.estado} className="rounded-xl bg-canvas p-3">
                  <h3 className="mb-2 flex items-center justify-between text-sm font-semibold">
                    {c.titulo} <Badge>{lista.length}</Badge>
                  </h3>
                  <ul className="space-y-2">
                    {lista.map((p) => (
                      <li key={p.id} className="rounded-lg border border-line bg-surface p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{p.id}</span>
                          <span>S/ {p.total.toFixed(2)}</span>
                        </div>
                        <p className="text-ink-muted">Franja {p.franja}</p>
                        <p className="mt-1 text-xs text-ink-muted">{p.items.map((i) => `${i.cantidad}× ${nombreProducto(i.productoId)}`).join(', ')}</p>
                        {c.siguiente && (
                          <Button className="mt-2 w-full !py-1.5" onClick={() => avanzarPedido(p.id)}>
                            {c.siguiente}
                          </Button>
                        )}
                      </li>
                    ))}
                    {lista.length === 0 && <li className="text-xs text-ink-muted">Sin pedidos</li>}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="h-stock">
          <h2 id="h-stock" className="mb-3 text-xl font-semibold">
            Alertas de stock
          </h2>
          <Card className="p-0">
            <ul className="divide-y divide-line">
              {alertas.map((a) => (
                <li key={a.productoId} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <span>
                    {a.imagen} {a.nombre}
                  </span>
                  {a.unidades === 0 ? <Badge tono="bad">Quiebre</Badge> : <Badge tono="warn">Quedan {a.unidades}</Badge>}
                </li>
              ))}
              {alertas.length === 0 && <li className="p-3 text-sm text-ink-muted">Sin alertas: todos los productos tienen stock suficiente.</li>}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="h-ia">
          <h2 id="h-ia" className="sr-only">
            Asistente
          </h2>
          <Asistente tiendaId={tiendaId} pedidos={deTienda} nps={nps} />
        </section>
      </div>

      <section aria-labelledby="h-comp">
        <h2 id="h-comp" className="mb-3 text-xl font-semibold">
          Antes y después de «Pide y recoge»
        </h2>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[28rem] text-sm">
            <thead className="bg-canvas text-left text-ink-muted">
              <tr>
                <th className="p-3 font-medium">Indicador</th>
                <th className="p-3 font-medium">Antes (cola en caja)</th>
                <th className="p-3 font-medium">Después (pide y recoge)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <Fila indicador="Tiempo de espera" antes={`${espera} min`} despues={`${RECOJO_MIN} min`} />
              <Fila indicador="Ahorro por cliente" antes="—" despues={`${Math.max(espera - RECOJO_MIN, 0)} min`} />
              <Fila indicador="Quiebres de stock avisados" antes="Al llegar a la tienda" despues="Antes de pedir (catálogo en vivo)" />
              <Fila indicador="Atención" antes="Desigual según la fila" despues="Cola ordenada por franja" />
              <Fila indicador="Quiebres hoy" antes="Sin alerta" despues={`${alertas.filter((a) => a.unidades === 0).length} detectados en el panel`} />
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-xs text-ink-muted">Cifras simuladas para la presentación; el tiempo en caja depende de la tienda elegida.</p>
      </section>
    </div>
  )
}

function Kpi({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota: string }) {
  return (
    <Card>
      <p className="text-sm text-ink-muted">{etiqueta}</p>
      <p className="mt-1 text-3xl font-semibold text-brand-dark">{valor}</p>
      <p className="mt-1 text-xs text-ink-muted">{nota}</p>
    </Card>
  )
}

function Fila({ indicador, antes, despues }: { indicador: string; antes: string; despues: string }) {
  return (
    <tr>
      <td className="p-3 font-medium">{indicador}</td>
      <td className="p-3 text-ink-muted">{antes}</td>
      <td className="p-3 text-ok">{despues}</td>
    </tr>
  )
}
