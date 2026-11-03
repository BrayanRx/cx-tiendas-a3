import { useState } from 'react'
import { Button, Card } from '@/components/ui'
import { useApp } from '@/lib/store'
import type { Pedido } from '@/lib/types'
import { MOTIVOS_RECLAMO } from './datos'

// Canal de postventa: reclamo o cambio, y cancelación mientras la tienda no empiece a preparar.
// El reclamo es simulado y vive solo en esta pantalla (no hay acción en el store para guardarlo).
export default function Postventa({ pedido }: { pedido: Pedido }) {
  const cancelarPedido = useApp((s) => s.cancelarPedido)
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [detalle, setDetalle] = useState('')
  const [ticket, setTicket] = useState<string | null>(null)
  const [confirmarCancelar, setConfirmarCancelar] = useState(false)

  if (pedido.estado === 'cancelado') return null

  const enviar = () => {
    if (!motivo) return
    setTicket('R-' + pedido.id.slice(-4) + String(Date.now()).slice(-3))
    setAbierto(false)
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">¿Algo salió mal?</h2>
      <p className="mt-1 text-sm text-ink-muted">Cuéntanos y te respondemos por WhatsApp en menos de 24 horas.</p>

      {ticket && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-ok" role="status">
          Recibimos tu reclamo <strong>{ticket}</strong>: «{motivo}». Te escribimos pronto.
        </div>
      )}

      {abierto ? (
        <div className="mt-4 space-y-3">
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">¿Qué pasó?</legend>
            {MOTIVOS_RECLAMO.map((m) => (
              <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line p-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => setMotivo(m)} className="accent-brand" />
                {m}
              </label>
            ))}
          </fieldset>
          <textarea
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            rows={2}
            placeholder="Cuéntanos un poco más (opcional)"
            className="w-full rounded-lg border border-line bg-surface p-2.5 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={enviar} disabled={!motivo}>
              Enviar reclamo
            </Button>
            <Button variante="ghost" onClick={() => setAbierto(false)}>
              Volver
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variante="secondary" onClick={() => setAbierto(true)}>
            Hacer un reclamo o cambio
          </Button>
          {pedido.estado === 'recibido' &&
            (confirmarCancelar ? (
              <>
                <Button variante="ghost" className="!text-bad" onClick={() => cancelarPedido(pedido.id)}>
                  Sí, cancelar pedido
                </Button>
                <Button variante="ghost" onClick={() => setConfirmarCancelar(false)}>
                  No
                </Button>
              </>
            ) : (
              <Button variante="ghost" className="!text-bad" onClick={() => setConfirmarCancelar(true)}>
                Cancelar pedido
              </Button>
            ))}
        </div>
      )}
    </Card>
  )
}
