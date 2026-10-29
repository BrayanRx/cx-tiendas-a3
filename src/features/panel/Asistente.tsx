import { useState } from 'react'
import { Badge, Button, Card } from '@/components/ui'
import { alertasStock, esperaCaja, generarSugerencias } from './datos'
import type { Pedido } from '@/lib/types'

interface Props {
  tiendaId: string
  pedidos: Pedido[]
  nps: number | null
}

const preguntas = ['¿Qué priorizo ahora?', '¿Qué debo reponer?', '¿Abro otra caja?', '¿Cómo va el NPS?'] as const
type Pregunta = (typeof preguntas)[number]

// Asistente IA simulado: reglas y respuestas preparadas en el frontend, sin claves ni servicios externos.
export default function Asistente({ tiendaId, pedidos, nps }: Props) {
  const [dialogo, setDialogo] = useState<{ q: Pregunta; a: string }[]>([])
  const sugerencias = generarSugerencias(tiendaId, pedidos, nps)

  const responder = (q: Pregunta): string => {
    const espera = esperaCaja(tiendaId)
    const activos = pedidos.filter((p) => p.estado === 'recibido' || p.estado === 'preparando' || p.estado === 'listo')
    switch (q) {
      case '¿Qué priorizo ahora?': {
        const primero = [...activos].sort((a, b) => a.franja.localeCompare(b.franja))[0]
        return primero
          ? `Atiende primero el pedido ${primero.id} (franja ${primero.franja}), hoy en estado «${primero.estado}».`
          : 'No hay pedidos activos. Aprovecha para reponer estantes.'
      }
      case '¿Qué debo reponer?': {
        const a = alertasStock(tiendaId).slice(0, 4)
        return a.length ? `Prioriza: ${a.map((x) => `${x.nombre} (${x.unidades})`).join(', ')}.` : 'No hay productos con stock bajo.'
      }
      case '¿Abro otra caja?':
        return espera >= 12
          ? `Sí. Con ${espera} min de espera, una segunda caja reduce la cola y libera al personal del mostrador.`
          : `Por ahora no hace falta: la espera es de ${espera} min.`
      case '¿Cómo va el NPS?':
        return nps === null ? 'Todavía no hay encuestas. Pide a los clientes que respondan en el Club 3A.' : `El NPS actual es ${nps}. ${nps >= 50 ? 'Es un buen nivel.' : 'Hay margen de mejora: revisa los comentarios.'}`
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Asistente IA</h2>
        <Badge tono="brand">Simulado</Badge>
      </div>
      <ul className="mt-3 space-y-2">
        {sugerencias.map((s) => (
          <li key={s.id} className="flex items-start gap-2 text-sm">
            <Badge tono={s.tono}>{s.tono === 'bad' ? 'Urgente' : s.tono === 'warn' ? 'Atención' : 'OK'}</Badge>
            <span>{s.texto}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-sm font-medium">Pregúntale al asistente</p>
        <div className="flex flex-wrap gap-2">
          {preguntas.map((q) => (
            <Button key={q} variante="secondary" className="!px-3 !py-1.5" onClick={() => setDialogo((d) => [...d, { q, a: responder(q) }])}>
              {q}
            </Button>
          ))}
        </div>
        {dialogo.length > 0 && (
          <div className="mt-3 space-y-3" aria-live="polite">
            {dialogo.slice(-3).map((m, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{m.q}</p>
                <p className="mt-1 rounded-lg bg-brand-soft p-3 text-brand-dark">{m.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
