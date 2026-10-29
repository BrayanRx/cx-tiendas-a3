import { useState } from 'react'
import { Badge, Button, Card } from '@/components/ui'
import { tiendas } from '@/data/tiendas'
import { useApp } from '@/lib/store'

const categoria = (p: number) => (p >= 9 ? 'promotor' : p >= 7 ? 'pasivo' : 'detractor')
const tonoNps = { promotor: 'ok', pasivo: 'warn', detractor: 'bad' } as const

// Encuesta NPS 0–10: guarda con registrarNps() para que el Panel calcule el indicador.
export default function NpsForm() {
  const { tiendaId, pedidos, encuestas, registrarNps } = useApp()
  const [puntaje, setPuntaje] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [pedidoId, setPedidoId] = useState('')
  const [enviada, setEnviada] = useState<number | null>(null)

  const recogidos = pedidos.filter((p) => p.estado === 'recogido')
  const tienda = tiendas.find((t) => t.id === tiendaId)

  const enviar = () => {
    if (puntaje === null) return
    const pedido = recogidos.find((p) => p.id === pedidoId)
    registrarNps({
      pedidoId: pedido?.id,
      tiendaId: pedido?.tiendaId ?? tiendaId,
      puntaje,
      comentario: comentario.trim() || undefined,
    })
    setEnviada(puntaje)
    setPuntaje(null)
    setComentario('')
    setPedidoId('')
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">¿Qué tan probable es que nos recomiendes?</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Calificando tu experiencia en {tienda?.nombre ?? 'la tienda'}. 0 = nada probable, 10 = muy probable.
      </p>

      {enviada !== null && (
        <p role="status" className="mt-4 rounded-lg bg-brand-soft p-3 text-sm text-brand-dark">
          ¡Gracias! Registramos tu calificación de {enviada}. Ya la ve el equipo de tienda en el panel.
        </p>
      )}

      <div role="radiogroup" aria-label="Puntaje de 0 a 10" className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-11">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={puntaje === n}
            onClick={() => setPuntaje(n)}
            className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              puntaje === n ? 'border-brand bg-brand text-white' : 'border-line bg-surface hover:border-brand'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>Nada probable</span>
        <span>Muy probable</span>
      </div>

      {puntaje !== null && (
        <p className="mt-3 text-sm">
          Serías un <Badge tono={tonoNps[categoria(puntaje)]}>{categoria(puntaje)}</Badge>
        </p>
      )}

      {recogidos.length > 0 && (
        <label className="mt-4 block text-sm">
          <span className="font-medium">Pedido que calificas (opcional)</span>
          <select
            value={pedidoId}
            onChange={(e) => setPedidoId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5"
          >
            <option value="">Experiencia general</option>
            {recogidos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · S/ {p.total.toFixed(2)}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="mt-4 block text-sm">
        <span className="font-medium">Comentario (opcional)</span>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="¿Qué podemos mejorar?"
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-muted">Encuestas enviadas: {encuestas.length}</span>
        <Button onClick={enviar} disabled={puntaje === null}>
          Enviar calificación
        </Button>
      </div>
    </Card>
  )
}
