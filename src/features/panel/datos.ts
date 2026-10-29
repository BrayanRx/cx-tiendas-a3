import { getProducto, productos } from '@/data/productos'
import { getTienda, stock } from '@/data/tiendas'
import type { Pedido, RespuestaNps } from '@/lib/types'

// Cálculos del panel de tienda: todo se deriva del estado compartido y de los datos simulados.

export const STOCK_BAJO = 8
/** Minutos que toma recoger en el mostrador «Pide y recoge» (simulado). */
export const RECOJO_MIN = 2

export interface AlertaStock {
  productoId: string
  nombre: string
  imagen: string
  unidades: number
}

export const alertasStock = (tiendaId: string): AlertaStock[] =>
  productos
    .map((p) => ({ productoId: p.id, nombre: `${p.nombre} ${p.presentacion}`, imagen: p.imagen, unidades: stock[tiendaId]?.[p.id] ?? 0 }))
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
  texto: string
}

// Reglas del asistente IA simulado: no usa ningún servicio externo.
export function generarSugerencias(tiendaId: string, pedidos: Pedido[], nps: number | null): Sugerencia[] {
  const out: Sugerencia[] = []
  const espera = esperaCaja(tiendaId)
  const recibidos = pedidos.filter((p) => p.estado === 'recibido')
  const listos = pedidos.filter((p) => p.estado === 'listo')
  const agotados = alertasStock(tiendaId).filter((a) => a.unidades === 0)
  const bajos = alertasStock(tiendaId).filter((a) => a.unidades > 0)

  if (espera >= 12)
    out.push({ id: 'caja', tono: 'bad', texto: `La espera en caja es de ${espera} min: abre una segunda caja y deriva clientes al mostrador «Pide y recoge».` })
  else if (espera >= 9)
    out.push({ id: 'caja', tono: 'warn', texto: `Espera en caja de ${espera} min. Si sube de 12, conviene abrir otra caja.` })

  if (recibidos.length >= 3)
    out.push({ id: 'cola', tono: 'warn', texto: `Hay ${recibidos.length} pedidos sin atender. Pasa a «preparando» los de franja más cercana primero.` })
  else if (recibidos.length > 0)
    out.push({ id: 'cola', tono: 'ok', texto: `Tienes ${recibidos.length} pedido(s) nuevo(s). Empieza a prepararlos para respetar la franja de recojo.` })

  if (listos.length > 0)
    out.push({ id: 'listos', tono: 'warn', texto: `${listos.length} pedido(s) listo(s) esperan al cliente. Verifica que el aviso por WhatsApp se haya enviado.` })

  if (agotados.length > 0)
    out.push({ id: 'agotado', tono: 'bad', texto: `Reponer con urgencia: ${agotados.slice(0, 3).map((a) => a.nombre).join(', ')}${agotados.length > 3 ? ` y ${agotados.length - 3} más` : ''}.` })
  if (bajos.length > 0)
    out.push({ id: 'bajo', tono: 'warn', texto: `Stock bajo en ${bajos.length} producto(s). Programa reposición antes de hora punta.` })

  if (nps !== null && nps < 30)
    out.push({ id: 'nps', tono: 'bad', texto: `El NPS está en ${nps}. Revisa los comentarios de los detractores y llama a esos clientes.` })

  if (!out.length) out.push({ id: 'ok', tono: 'ok', texto: 'Todo en orden: sin pedidos pendientes ni quiebres de stock.' })
  return out
}

export const nombreProducto = (id: string) => getProducto(id)?.nombre ?? id
