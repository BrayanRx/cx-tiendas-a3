import type { EstadoPedido, MetodoPago, Pedido } from '@/lib/types'
import { getTienda } from '@/data/tiendas'

// Textos y datos simulados del módulo de seguimiento.

export const PASOS: { estado: EstadoPedido; titulo: string; detalle: string }[] = [
  { estado: 'recibido', titulo: 'Recibido', detalle: 'La tienda ya tiene tu pedido.' },
  { estado: 'preparando', titulo: 'Preparando', detalle: 'Estamos armando tu bolsa.' },
  { estado: 'listo', titulo: 'Listo para recoger', detalle: 'Acércate al mostrador Pide y recoge.' },
  { estado: 'recogido', titulo: 'Recogido', detalle: '¡Gracias por tu compra!' },
]

export const etiquetaEstado: Record<EstadoPedido, string> = {
  recibido: 'Recibido',
  preparando: 'Preparando',
  listo: 'Listo',
  recogido: 'Recogido',
  cancelado: 'Cancelado',
}

export const tonoEstado = {
  recibido: 'neutral',
  preparando: 'warn',
  listo: 'brand',
  recogido: 'ok',
  cancelado: 'bad',
} as const

export const etiquetaPago: Record<MetodoPago, string> = {
  qr: 'Pagado con QR',
  tarjeta: 'Pagado con tarjeta',
  'efectivo-en-tienda': 'Pagas al recoger',
}

/** Mensaje tipo WhatsApp que recibiría el cliente en cada cambio de estado (simulado, no se envía). */
export function mensajeWhatsapp(p: Pedido): string {
  const tienda = getTienda(p.tiendaId)?.nombre ?? 'tu tienda'
  switch (p.estado) {
    case 'recibido':
      return `¡Hola! 👋 Recibimos tu pedido ${p.id} en ${tienda}. Te avisamos apenas empecemos a prepararlo.`
    case 'preparando':
      return `Estamos armando tu pedido ${p.id} 🛒. Te escribimos cuando esté listo.`
    case 'listo':
      return `¡Tu pedido ${p.id} está listo! ✅ Recógelo en el mostrador Pide y recoge de ${tienda} entre ${p.franja}. Muestra tu código y listo, sin fila.`
    case 'recogido':
      return `Gracias por comprar en ${tienda} 🧡. Ganaste ${p.puntosGanados} puntos. ¿Nos cuentas qué tal te fue? Responde la encuesta en el Club 3A.`
    case 'cancelado':
      return `Tu pedido ${p.id} fue cancelado. Si pagaste, te devolvemos el monto en 24 horas.`
  }
}

/** Motivos de reclamo o cambio más comunes en una tienda de descuento. */
export const MOTIVOS_RECLAMO = [
  'Me faltó un producto',
  'Un producto llegó en mal estado',
  'Quiero cambiar un producto',
  'El cobro no es correcto',
  'Otro motivo',
]
