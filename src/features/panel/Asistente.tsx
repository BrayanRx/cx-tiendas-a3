import { useState, type FormEvent } from 'react'
import { Badge, Button, Card } from '@/components/ui'
import { alertasStock, esperaCaja, generarSugerencias, RECOJO_MIN } from './datos'
import type { Pedido } from '@/lib/types'

interface Props {
  tiendaId: string
  pedidos: Pedido[]
  nps: number | null
  onAvanzarPrioritario?: (pedidoId: string) => void
}

const preguntas = [
  '¿Qué priorizo ahora?',
  '¿Qué debo reponer?',
  '¿Abro otra caja?',
  '¿Cómo va el NPS?',
  '¿Qué pasa con los bodegueros?',
] as const

// Asistente IA simulado: reglas y respuestas preparadas en el frontend, sin claves ni servicios externos.
export default function Asistente({ tiendaId, pedidos, nps, onAvanzarPrioritario }: Props) {
  const [dialogo, setDialogo] = useState<{ q: string; a: string; pedidoAccionId?: string }[]>([])
  const [consulta, setConsulta] = useState('')
  const sugerencias = generarSugerencias(tiendaId, pedidos, nps)

  const responder = (texto: string): { a: string; pedidoAccionId?: string } => {
    const q = texto.toLowerCase()
    const espera = esperaCaja(tiendaId)
    const activos = pedidos.filter((p) => p.estado === 'recibido' || p.estado === 'preparando' || p.estado === 'listo')
    const alertas = alertasStock(tiendaId)
    const agotados = alertas.filter((x) => x.unidades === 0)
    const bajos = alertas.filter((x) => x.unidades > 0)

    if (q.includes('prioriz') || q.includes('pedido') || q.includes('cola') || q.includes('atend')) {
      const primero = [...activos].sort((a, b) => a.franja.localeCompare(b.franja))[0]
      if (!primero) {
        return {
          a: 'No hay pedidos activos en cola. Aprovecha este valle para reponer góndolas y ordenar el mostrador «Pide y recoge».',
        }
      }
      return {
        a: `Atiende primero el pedido ${primero.id} (franja ${primero.franja}), que está en estado «${primero.estado}». Así aseguras el recojo en ${RECOJO_MIN} min sin fila.`,
        pedidoAccionId: primero.id,
      }
    }

    if (q.includes('repon') || q.includes('stock') || q.includes('quiebre') || q.includes('agotad')) {
      if (!alertas.length) {
        return { a: 'No hay alertas de stock en esta tienda. Toda la canasta básica está cubierta.' }
      }
      const urgentes = agotados.length
        ? `En quiebre (0 unid.): ${agotados.map((x) => x.nombre).join(', ')}. `
        : ''
      const preventivos = bajos.length
        ? `Stock bajo: ${bajos.slice(0, 4).map((x) => `${x.nombre} (${x.unidades} unid.)`).join(', ')}.`
        : ''
      return {
        a: `${urgentes}${preventivos} Prioriza marcas propias para sostener la garantía de disponibilidad.`,
      }
    }

    if (q.includes('caja') || q.includes('espera') || q.includes('hora punta')) {
      return {
        a:
          espera >= 12
            ? `Sí: con ${espera} min de espera en caja estamos en hora punta crítica. Abre una segunda caja e invita a los clientes de canasta chica a pedir por QR para su próxima visita.`
            : `Por ahora la espera en caja es de ${espera} min (meta < 12 min). Mantén 1 cajero en fila tradicional y 1 encargado de picking en el mostrador «Pide y recoge».`,
      }
    }

    if (q.includes('nps') || q.includes('encuesta') || q.includes('reclamo') || q.includes('cliente')) {
      return {
        a:
          nps === null
            ? 'Todavía no hay encuestas NPS registradas en esta tienda. Recuerda invitar al cliente a calificar en el Club 3A al entregar su pedido.'
            : `El NPS actual de la tienda es ${nps}. ${nps >= 50 ? 'Excelente nivel de satisfacción: el ahorro de tiempo está fidelizando más allá del precio.' : 'Hay oportunidad de mejora: revisa tiempos de entrega en mostrador y evita quiebres de marca propia.'}`,
      }
    }

    if (q.includes('bodeguero') || q.includes('volumen') || q.includes('mayor')) {
      const volAlertas = alertas.filter((a) => a.esVolumen)
      return {
        a: volAlertas.length
          ? `Atención con el segmento bodegueros: ${volAlertas.map((x) => `${x.nombre} (${x.unidades} unid.)`).join(', ')} tienen descuento por volumen y poco stock. Separa cajas completas en trastienda.`
          : 'Los productos con precio por volumen (arroz, aceite, azúcar, leche) tienen buen stock para atender pedidos de bodegueros sin afectar a las familias.',
      }
    }

    return {
      a: `Resumen operativo: espera en caja de ${espera} min, ${activos.length} pedido(s) activo(s) en back-stage y ${agotados.length} producto(s) en quiebre. Usa los botones rápidos para ver acciones puntuales.`,
    }
  }

  const preguntar = (q: string) => {
    const res = responder(q)
    setDialogo((d) => [...d, { q, ...res }])
  }

  const enviarFormulario = (e: FormEvent) => {
    e.preventDefault()
    const limpio = consulta.trim()
    if (!limpio) return
    preguntar(limpio)
    setConsulta('')
  }

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Asistente IA de tienda</h2>
            <p className="text-xs text-ink-muted">Copiloto de back-stage · Prioriza capacidad, stock y atención</p>
          </div>
          <Badge tono="brand">IA · Reglas en vivo</Badge>
        </div>

        <ul className="mt-4 space-y-2.5">
          {sugerencias.map((s) => (
            <li key={s.id} className="rounded-lg border border-line bg-canvas p-3 text-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge tono={s.tono}>{s.tono === 'bad' ? 'Urgente' : s.tono === 'warn' ? 'Atención' : 'OK'}</Badge>
                <span className="text-xs font-medium text-ink-muted">{s.concepto}</span>
              </div>
              <p className="text-ink">{s.texto}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-sm font-medium">Pregúntale al copiloto</p>
        <div className="flex flex-wrap gap-1.5">
          {preguntas.map((q) => (
            <Button key={q} variante="secondary" className="!px-2.5 !py-1 text-xs" onClick={() => preguntar(q)}>
              {q}
            </Button>
          ))}
        </div>

        <form onSubmit={enviarFormulario} className="mt-2.5 flex gap-2">
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Ej. ¿Cómo vamos en hora punta?"
            aria-label="Escribir consulta al asistente IA"
            className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
          />
          <Button type="submit" variante="secondary" className="!px-3 !py-1.5 text-xs">
            Consultar
          </Button>
        </form>

        {dialogo.length > 0 && (
          <div className="mt-3 space-y-2.5" aria-live="polite">
            {dialogo.slice(-3).map((m, i) => (
              <div key={i} className="rounded-lg bg-brand-soft p-3 text-sm">
                <p className="text-xs font-semibold text-brand-dark">{m.q}</p>
                <p className="mt-1 text-brand-dark">{m.a}</p>
                {m.pedidoAccionId && onAvanzarPrioritario && (
                  <Button
                    variante="primary"
                    className="mt-2 !px-3 !py-1 text-xs"
                    onClick={() => onAvanzarPrioritario(m.pedidoAccionId!)}
                  >
                    Avanzar pedido {m.pedidoAccionId} ahora
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

