import { formatHora } from '@/lib/format'

// Vista previa de un mensaje tipo WhatsApp que recibiría el cliente (simulado: no se envía nada).
// Ej.: <AvisoWhatsapp mensaje="¡Tu pedido está listo!" hora={pedido.actualizadoEn} />
export default function AvisoWhatsapp({
  mensaje,
  hora,
  remitente = 'Tiendas 3A · Pide y recoge',
  titulo,
}: {
  mensaje: string
  /** Momento del mensaje en milisegundos. Si no se pasa, dice «ahora». */
  hora?: number
  remitente?: string
  /** Título opcional sobre la burbuja, ej. "Así te avisamos por WhatsApp". */
  titulo?: string
}) {
  return (
    <figure>
      {titulo && <figcaption className="mb-2 text-sm font-medium text-ink-muted">{titulo}</figcaption>}
      <div className="rounded-xl bg-canvas p-4">
        <div className="max-w-sm rounded-xl rounded-tl-sm border border-line bg-green-50 p-3 text-sm shadow-sm">
          <p className="text-xs font-semibold text-ok">{remitente}</p>
          <p className="mt-1 whitespace-pre-line text-ink">{mensaje}</p>
          <p className="mt-1 text-right text-xs text-ink-muted">{hora ? formatHora(hora) : 'ahora'} ✓✓</p>
        </div>
      </div>
    </figure>
  )
}
