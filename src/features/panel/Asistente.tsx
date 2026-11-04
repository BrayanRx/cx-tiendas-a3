import { useState, type FormEvent } from 'react'
import Icono from '@/components/Icono'
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
  const [dialogo, setDialogo] = useState<{ q: string; a: string; datosUsados: string; pedidoAccionId?: string }[]>([])
  const [consulta, setConsulta] = useState('')
  const sugerencias = generarSugerencias(tiendaId, pedidos, nps)

  const responder = (texto: string): { a: string; datosUsados: string; pedidoAccionId?: string } => {
    const q = texto.toLowerCase()
    const espera = esperaCaja(tiendaId)
    const activos = pedidos.filter((p) => p.estado === 'recibido' || p.estado === 'preparando' || p.estado === 'listo')
    const alertas = alertasStock(tiendaId)
    const agotados = alertas.filter((x) => x.unidades === 0)
    const bajos = alertas.filter((x) => x.unidades > 0)

    if (q.includes('prioriz') || q.includes('hago') || q.includes('pedido') || q.includes('cola') || q.includes('atend')) {
      const primero = [...activos].sort((a, b) => a.franja.localeCompare(b.franja))[0]
      if (!primero) {
        return {
          a: 'No hay pedidos activos en cola. Aprovecha este valle para reponer góndolas y ordenar el mostrador «Pide y recoge».',
          datosUsados: `Cola activa: 0 pedidos · Espera en caja: ${espera} min`,
        }
      }
      return {
        a: `Atiende primero el pedido ${primero.id} (franja ${primero.franja}), que está en estado «${primero.estado}». Así aseguras el recojo en ${RECOJO_MIN} min sin fila.`,
        datosUsados: `Cola activa: ${activos.length} pedido(s) · Franja más próxima: ${primero.franja}`,
        pedidoAccionId: primero.id,
      }
    }

    if (q.includes('repon') || q.includes('stock') || q.includes('quiebre') || q.includes('agotad')) {
      if (!alertas.length) {
        return {
          a: 'No hay alertas de stock en esta tienda. Toda la canasta básica está cubierta.',
          datosUsados: `Stock de la tienda: 0 alertas`,
        }
      }
      const urgentes = agotados.length
        ? `En quiebre (0 unid.): ${agotados.map((x) => x.nombre).join(', ')}. `
        : ''
      const preventivos = bajos.length
        ? `Stock bajo: ${bajos.slice(0, 4).map((x) => `${x.nombre} (${x.unidades} unid.)`).join(', ')}.`
        : ''
      return {
        a: `${urgentes}${preventivos} Prioriza las marcas propias para que no falten en góndola.`,
        datosUsados: `Inventario de la tienda: ${agotados.length} quiebre(s) y ${bajos.length} con stock bajo`,
      }
    }

    if (q.includes('caja') || q.includes('espera') || q.includes('hora punta')) {
      return {
        a:
          espera >= 12
            ? `Sí: con ${espera} min de espera en caja estamos en hora punta crítica. Abre una segunda caja e invita a los clientes de canasta chica a pedir por QR para su próxima visita.`
            : `Por ahora la espera en caja es de ${espera} min (meta < 12 min). Mantén 1 cajero en fila tradicional y 1 encargado de picking en el mostrador «Pide y recoge».`,
        datosUsados: `Tiempo de espera en caja: ${espera} min vs. ${RECOJO_MIN} min en mostrador`,
      }
    }

    if (q.includes('nps') || q.includes('encuesta') || q.includes('reclamo') || q.includes('cliente')) {
      return {
        a:
          nps === null
            ? 'Todavía no hay encuestas NPS registradas en esta tienda. Recuerda invitar al cliente a calificar en el Club 3A al entregar su pedido.'
            : `El NPS actual de la tienda es ${nps}. ${nps >= 50 ? 'Excelente nivel de satisfacción: el ahorro de tiempo está fidelizando más allá del precio.' : 'Hay oportunidad de mejora: revisa tiempos de entrega en mostrador y evita quiebres de marca propia.'}`,
        datosUsados: `Encuestas NPS de la sede: ${nps === null ? 'sin registros' : `puntaje ${nps}`}`,
      }
    }

    if (q.includes('bodeguero') || q.includes('volumen') || q.includes('mayor')) {
      const volAlertas = alertas.filter((a) => a.esVolumen)
      return {
        a: volAlertas.length
          ? `Atención con el segmento bodegueros: ${volAlertas.map((x) => `${x.nombre} (${x.unidades} unid.)`).join(', ')} tienen descuento por volumen y poco stock. Separa cajas completas en trastienda.`
          : 'Los productos con precio por volumen (arroz, aceite, azúcar, leche) tienen buen stock para atender pedidos de bodegueros sin afectar a las familias.',
        datosUsados: `Productos de formato bodeguero en alerta: ${volAlertas.length}`,
      }
    }

    return {
      a: `Resumen operativo: espera en caja de ${espera} min, ${activos.length} pedido(s) activo(s) y ${agotados.length} producto(s) en quiebre. Usa los botones rápidos para ver acciones puntuales.`,
      datosUsados: `Indicadores en vivo: espera ${espera} min · ${activos.length} activos · ${agotados.length} quiebres`,
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
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <Icono nombre="check" className="size-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Copiloto IA de tienda</h3>
              <p className="text-xs text-ink-muted">Recomendaciones con los datos en vivo de tu tienda</p>
            </div>
          </div>
          <Badge tono="brand">IA · Reglas en vivo</Badge>
        </div>

        <ul className="mt-4 space-y-2.5">
          {sugerencias.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-line bg-canvas p-3.5 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <Badge tono={s.tono}>{s.tono === 'bad' ? 'Urgente' : s.tono === 'warn' ? 'Atención' : 'OK'}</Badge>
                <span className="text-xs font-semibold text-accent">{s.concepto}</span>
              </div>
              <p className="text-ink">{s.texto}</p>
              <p className="mt-1.5 text-[11px] font-medium text-ink-muted">{s.fuenteDatos}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">Pregúntale al copiloto</p>
        <div className="flex flex-wrap gap-1.5">
          {preguntas.map((q) => (
            <Button key={q} variante="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => preguntar(q)}>
              {q}
            </Button>
          ))}
        </div>

        <form onSubmit={enviarFormulario} className="mt-3 flex gap-2">
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Ej. ¿Qué hago ahora en hora punta?"
            aria-label="Escribir consulta al asistente IA"
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm"
          />
          <Button type="submit" variante="primary" className="!px-4 !py-2 text-xs">
            Consultar <Icono nombre="flecha" className="size-3.5" />
          </Button>
        </form>

        {dialogo.length > 0 && (
          <div className="mt-3 space-y-2.5" aria-live="polite">
            {dialogo.slice(-3).map((m, i) => (
              <div key={i} className="rounded-2xl bg-brand-soft p-3.5 text-sm">
                <p className="text-xs font-bold text-brand-dark">{m.q}</p>
                <p className="mt-1 text-ink">{m.a}</p>
                <p className="mt-1 text-[11px] font-medium text-brand-dark/80">Fuente IA: {m.datosUsados}</p>
                {m.pedidoAccionId && onAvanzarPrioritario && (
                  <Button
                    variante="primary"
                    className="mt-2.5 !px-3.5 !py-1.5 text-xs"
                    onClick={() => onAvanzarPrioritario(m.pedidoAccionId!)}
                  >
                    Avanzar pedido {m.pedidoAccionId} <Icono nombre="flecha" className="size-3.5" />
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


