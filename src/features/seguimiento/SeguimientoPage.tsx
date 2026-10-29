import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { getTienda } from '@/data/tiendas'
import { formatFecha, formatHora, formatSoles } from '@/lib/format'
import { useApp } from '@/lib/store'
import type { Pedido } from '@/lib/types'
import DetallePedido from './DetallePedido'
import { ITEMS_DEMO, etiquetaEstado, proximaFranja, tonoEstado } from './datos'

// Responsable: Hemsy Cárdenas · rama feat/seguimiento
// Lee: pedidos (useApp) y el parámetro :id (useParams de react-router-dom)
// Escribe: cancelarPedido; enlaza a /club para la encuesta NPS al recoger
export default function SeguimientoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pedidos = useApp((s) => s.pedidos)

  if (id) {
    const pedido = pedidos.find((p) => p.id === id)
    if (!pedido) {
      return (
        <Card className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-semibold">No encontramos el pedido {id}</h1>
          <p className="mt-1 text-sm text-ink-muted">Revisa el código o busca tu pedido en la lista.</p>
          <Button variante="secondary" className="mt-4" onClick={() => navigate('/seguimiento')}>
            Ver mis pedidos
          </Button>
        </Card>
      )
    }
    return <DetallePedido pedido={pedido} />
  }

  return <MisPedidos />
}

function MisPedidos() {
  const navigate = useNavigate()
  const pedidos = useApp((s) => s.pedidos)
  const activos = pedidos.filter((p) => p.estado !== 'recogido' && p.estado !== 'cancelado')
  const anteriores = pedidos.filter((p) => p.estado === 'recogido' || p.estado === 'cancelado')

  return (
    <div>
      <PageHeader titulo="Mis pedidos" descripcion="Sigue tu pedido paso a paso, recógelo sin fila y avísanos si algo salió mal.">
        <CrearPedidoDemo />
      </PageHeader>

      {pedidos.length === 0 ? (
        <Card className="text-center">
          <p className="text-4xl" aria-hidden>
            🛍️
          </p>
          <h2 className="mt-2 text-lg font-semibold">Aún no tienes pedidos</h2>
          <p className="mt-1 text-sm text-ink-muted">Arma tu canasta, paga con QR y aquí verás en qué va.</p>
          <Button className="mt-4" onClick={() => navigate('/catalogo')}>
            Ir al catálogo
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          <ListaPedidos titulo="En curso" lista={activos} vacio="No tienes pedidos en curso." />
          {anteriores.length > 0 && <ListaPedidos titulo="Anteriores" lista={anteriores} />}
        </div>
      )}
    </div>
  )
}

function ListaPedidos({ titulo, lista, vacio }: { titulo: string; lista: Pedido[]; vacio?: string }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{titulo}</h2>
      {lista.length === 0 && vacio && <p className="text-sm text-ink-muted">{vacio}</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {lista.map((p) => (
          <li key={p.id}>
            <Link to={`/seguimiento/${p.id}`} className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-semibold">{p.id}</span>
                <Badge tono={tonoEstado[p.estado]}>{etiquetaEstado[p.estado]}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {getTienda(p.tiendaId)?.nombre} · {formatFecha(p.creadoEn)}, {formatHora(p.creadoEn)}
              </p>
              <div className="mt-2 flex justify-between text-sm">
                <span>Recojo {p.franja}</span>
                <span className="font-semibold">{formatSoles(p.total)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Crea un pedido de ejemplo para probar el seguimiento sin pasar por el módulo de Pedido.
// Respeta el carrito que el cliente ya tenía armado.
function CrearPedidoDemo() {
  const { carrito, vaciarCarrito, agregarAlCarrito, crearPedido } = useApp()

  const crear = () => {
    const previo = carrito
    vaciarCarrito()
    ITEMS_DEMO.forEach((i) => agregarAlCarrito(i.productoId, i.cantidad))
    crearPedido({ franja: proximaFranja(), metodoPago: 'qr' })
    previo.forEach((i) => agregarAlCarrito(i.productoId, i.cantidad))
  }

  return (
    <Button variante="secondary" onClick={crear}>
      + Pedido de ejemplo
    </Button>
  )
}
