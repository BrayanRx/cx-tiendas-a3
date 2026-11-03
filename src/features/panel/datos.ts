import { getProducto, productos } from '@/data/productos'
import { getTienda, stock } from '@/data/tiendas'
import type { MetodoPago, Pedido, RespuestaNps } from '@/lib/types'

// Cálculos del panel de tienda: todo se deriva del estado compartido y de los datos simulados.

export const STOCK_BAJO = 8
/** Minutos que toma recoger en el mostrador «Pide y recoge» (simulado). */
export const RECOJO_MIN = 2

export interface AlertaStock {
  productoId: string
  nombre: string
  marca: string
  marcaPropia: boolean
  esVolumen: boolean
  imagen: string
  foto?: string
  unidades: number
}

export const alertasStock = (tiendaId: string): AlertaStock[] =>
  productos
    .map((p) => ({
      productoId: p.id,
      nombre: `${p.nombre} ${p.presentacion}`,
      marca: p.marca,
      marcaPropia: p.marcaPropia,
      esVolumen: Boolean(p.precioVolumen && p.volumenMin),
      imagen: p.imagen,
      foto: p.foto,
      unidades: stock[tiendaId]?.[p.id] ?? 0,
    }))
    .filter((a) => a.unidades <= STOCK_BAJO)
    .sort((a, b) => a.unidades - b.unidades)

const esHoy = (t: number) => new Date(t).toDateString() === new Date().toDateString()

export const pedidosDeHoy = (pedidos: Pedido[]) => pedidos.filter((p) => esHoy(p.creadoEn))

/** NPS = % promotores (9-10) − % detractores (0-6). null si no hay encuestas. */
export const calcularNps = (encuestas: RespuestaNps[]) => {
  if (!encuestas.length) return null
  const prom = encuestas.filter((e) => e.puntaje >= 9).length
  const detr = encuestas.filter((e) => e.puntaje <= 6).length
  return Math.round(((prom - detr) / encuestas.length) * 100)
}

export const desgloseNps = (encuestas: RespuestaNps[]) => {
  const promotores = encuestas.filter((e) => e.puntaje >= 9).length
  const pasivos = encuestas.filter((e) => e.puntaje >= 7 && e.puntaje <= 8).length
  const detractores = encuestas.filter((e) => e.puntaje <= 6).length
  return { promotores, pasivos, detractores, total: encuestas.length }
}

/** Recompra = % de pedidos que repiten algún producto de un pedido anterior. null con menos de 2 pedidos. */
export const calcularRecompra = (pedidos: Pedido[]) => {
  if (pedidos.length < 2) return null
  const ordenados = [...pedidos].sort((a, b) => a.creadoEn - b.creadoEn)
  const vistos = new Set<string>()
  let repiten = 0
  ordenados.forEach((p, i) => {
    if (i > 0 && p.items.some((it) => vistos.has(it.productoId))) repiten++
    p.items.forEach((it) => vistos.add(it.productoId))
  })
  return Math.round((repiten / (ordenados.length - 1)) * 100)
}

export const esperaCaja = (tiendaId: string) => getTienda(tiendaId)?.esperaCajaMin ?? 0

export interface Sugerencia {
  id: string
  tono: 'bad' | 'warn' | 'ok'
  concepto: string
  fuenteDatos: string
  texto: string
}

// Reglas del asistente IA simulado: no usa ningún servicio externo.
export function generarSugerencias(tiendaId: string, pedidos: Pedido[], nps: number | null): Sugerencia[] {
  const out: Sugerencia[] = []
  const espera = esperaCaja(tiendaId)
  const recibidos = pedidos.filter((p) => p.estado === 'recibido')
  const preparando = pedidos.filter((p) => p.estado === 'preparando')
  const listos = pedidos.filter((p) => p.estado === 'listo')
  const agotados = alertasStock(tiendaId).filter((a) => a.unidades === 0)
  const bajos = alertasStock(tiendaId).filter((a) => a.unidades > 0)

  if (espera >= 12)
    out.push({
      id: 'caja',
      tono: 'bad',
      concepto: 'Capacidad · 7P (Process)',
      fuenteDatos: `Datos: esperaCajaMin = ${espera} min (umbral ≥ 12 min)`,
      texto: `La espera en caja es de ${espera} min: abre una segunda caja y deriva clientes con carrito chico al mostrador «Pide y recoge».`,
    })
  else if (espera >= 9)
    out.push({
      id: 'caja',
      tono: 'warn',
      concepto: 'Capacidad · Hora punta',
      fuenteDatos: `Datos: esperaCajaMin = ${espera} min (alerta preventiva 9–11 min)`,
      texto: `Espera en caja de ${espera} min. Si sube de 12 min, habilita caja rápida de apoyo.`,
    })

  if (recibidos.length >= 3)
    out.push({
      id: 'cola',
      tono: 'warn',
      concepto: 'Back-stage · SLA franja',
      fuenteDatos: `Datos: ${recibidos.length} pedidos en estado «recibido»`,
      texto: `Hay ${recibidos.length} pedidos nuevos sin atender. Pasa a «preparando» los de franja más cercana primero.`,
    })
  else if (recibidos.length > 0)
    out.push({
      id: 'cola',
      tono: 'ok',
      concepto: 'Back-stage · Picking',
      fuenteDatos: `Datos: ${recibidos.length} pedido(s) en «recibido» · meta recojo ${RECOJO_MIN} min`,
      texto: `Tienes ${recibidos.length} pedido(s) recibido(s). Inicia el armado para cumplir la promesa de recojo en ${RECOJO_MIN} min.`,
    })

  if (preparando.length >= 3)
    out.push({
      id: 'prep',
      tono: 'warn',
      concepto: 'Cuello de botella',
      fuenteDatos: `Datos: ${preparando.length} pedidos simultáneos en «preparando»`,
      texto: `${preparando.length} pedidos en preparación simultánea. Asigna un colaborador adicional al armado.`,
    })

  if (listos.length > 0)
    out.push({
      id: 'listos',
      tono: 'warn',
      concepto: 'Front-stage · WhatsApp',
      fuenteDatos: `Datos: ${listos.length} pedido(s) en estado «listo» en mostrador`,
      texto: `${listos.length} pedido(s) listo(s) en mostrador. Confirma que el cliente recibió el aviso con su código QR.`,
    })

  if (agotados.length > 0)
    out.push({
      id: 'agotado',
      tono: 'bad',
      concepto: 'Garantía · Disponibilidad',
      fuenteDatos: `Datos: stock[${tiendaId}] = 0 en ${agotados.length} SKU(s)`,
      texto: `Quiebre de stock (${agotados.length}): reponer de trastienda ${agotados.slice(0, 3).map((a) => a.nombre).join(', ')}${agotados.length > 3 ? ` y ${agotados.length - 3} más` : ''}.`,
    })
  if (bajos.length > 0)
    out.push({
      id: 'bajo',
      tono: 'warn',
      concepto: 'Prevención de quiebre',
      fuenteDatos: `Datos: ${bajos.length} SKU(s) con stock ≤ ${STOCK_BAJO} unid.`,
      texto: `Stock bajo en ${bajos.length} producto(s). Adelanta reposición antes del pico de las 18:00.`,
    })

  if (nps !== null && nps < 30)
    out.push({
      id: 'nps',
      tono: 'bad',
      concepto: 'Voz del cliente · NPS',
      fuenteDatos: `Datos: NPS sede = ${nps} (meta ≥ 50)`,
      texto: `El NPS está en ${nps}. Revisa los comentarios de detractores y prioriza la exactitud en el armado.`,
    })

  if (!out.length)
    out.push({
      id: 'ok',
      tono: 'ok',
      concepto: 'Operación estable',
      fuenteDatos: `Datos: espera ${espera} min · 0 quiebres · 0 atrasos`,
      texto: 'Todo en orden: flujo de caja controlado y sin pedidos atrasados.',
    })
  return out
}

export const nombreProducto = (id: string) => getProducto(id)?.nombre ?? id

export const etiquetaMetodoPago: Record<MetodoPago, string> = {
  qr: 'Pago QR',
  tarjeta: 'Tarjeta',
  'efectivo-en-tienda': 'Pago en tienda',
}

export const avisoFrontStage: Record<Pedido['estado'], string> = {
  recibido: '¡Hola! Recibimos tu pedido en Tiendas 3A. Te avisaremos por aquí cuando empecemos a armarlo.',
  preparando: 'Estamos armando tu pedido en tienda para tenerlo listo en tu franja de recojo.',
  listo: '¡Tu pedido está listo! Pasa directo por el mostrador «Pide y recoge» y muestra tu código QR sin hacer cola.',
  recogido: '¡Gracias por recoger tu pedido! Sumaste puntos en el Club 3A. Cuéntanos del 0 al 10 cómo te fue hoy.',
  cancelado: 'Tu pedido fue cancelado. Si necesitas ayuda, escríbenos por este canal.',
}

