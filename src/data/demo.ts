import type { EstadoPedido, ItemCarrito, MetodoPago, RespuestaNps } from '@/lib/types'

// Datos de demostración para la presentación en vivo: pedidos y encuestas de ejemplo.
// Se cargan con `cargarDemo()` de useApp (botón en la página de inicio). Las fechas se calculan
// respecto al momento de carga para que el Panel siempre muestre pedidos «de hoy».

export interface PedidoDemo {
  id: string
  tiendaId: string
  items: ItemCarrito[]
  metodoPago: MetodoPago
  estado: EstadoPedido
  /** Minutos antes del momento de carga en que se creó el pedido. */
  hace: number
}

const MIN = 60_000
const DIA = 24 * 60 * MIN

// Tienda Canto Grande (la elegida por defecto) concentra la demo: cola activa e historial de compras.
// Tienda Túpac Amaru tiene un par de pedidos para mostrar que el Panel cambia según la tienda.
export const pedidosDemo: PedidoDemo[] = [
  // Hoy, en la cola del Panel
  { id: 'P4K7QA', tiendaId: 't-sjl', metodoPago: 'qr', estado: 'recibido', hace: 4, items: [{ productoId: 'arroz-5kg', cantidad: 1 }, { productoId: 'aceite-1l', cantidad: 2 }, { productoId: 'huevos-15', cantidad: 1 }] },
  { id: 'P4K9TB', tiendaId: 't-sjl', metodoPago: 'efectivo-en-tienda', estado: 'recibido', hace: 9, items: [{ productoId: 'leche-400', cantidad: 24 }, { productoId: 'azucar-1kg', cantidad: 12 }] },
  { id: 'P4JZ2C', tiendaId: 't-sjl', metodoPago: 'qr', estado: 'preparando', hace: 18, items: [{ productoId: 'pollo-1kg', cantidad: 2 }, { productoId: 'papa-1kg', cantidad: 3 }, { productoId: 'gaseosa-3l', cantidad: 1 }] },
  { id: 'P4JX8D', tiendaId: 't-sjl', metodoPago: 'tarjeta', estado: 'listo', hace: 35, items: [{ productoId: 'panales-m', cantidad: 1 }, { productoId: 'papel-12', cantidad: 1 }, { productoId: 'leche-400', cantidad: 6 }] },
  { id: 'P4JR5E', tiendaId: 't-sjl', metodoPago: 'qr', estado: 'recogido', hace: 95, items: [{ productoId: 'fideos-500', cantidad: 4 }, { productoId: 'atun-170', cantidad: 3 }, { productoId: 'aceite-1l', cantidad: 1 }] },
  // Días anteriores: historial del cliente, puntos del Club y recompra
  { id: 'P3W1HF', tiendaId: 't-sjl', metodoPago: 'qr', estado: 'recogido', hace: 3 * DIA / MIN, items: [{ productoId: 'arroz-5kg', cantidad: 1 }, { productoId: 'leche-400', cantidad: 6 }, { productoId: 'detergente-2kg', cantidad: 1 }] },
  { id: 'P3M6KG', tiendaId: 't-sjl', metodoPago: 'efectivo-en-tienda', estado: 'recogido', hace: 10 * DIA / MIN, items: [{ productoId: 'aceite-1l', cantidad: 2 }, { productoId: 'huevos-15', cantidad: 1 }, { productoId: 'lejia-1l', cantidad: 2 }] },
  { id: 'P3C2NH', tiendaId: 't-sjl', metodoPago: 'qr', estado: 'cancelado', hace: 12 * DIA / MIN, items: [{ productoId: 'yogurt-1l', cantidad: 2 }] },
  // Otra tienda
  { id: 'P4K2RJ', tiendaId: 't-comas', metodoPago: 'qr', estado: 'preparando', hace: 12, items: [{ productoId: 'arroz-5kg', cantidad: 6 }, { productoId: 'aceite-1l', cantidad: 12 }] },
  { id: 'P4JV7K', tiendaId: 't-comas', metodoPago: 'tarjeta', estado: 'listo', hace: 26, items: [{ productoId: 'queso-500', cantidad: 1 }, { productoId: 'avena-900', cantidad: 1 }, { productoId: 'agua-2l', cantidad: 2 }] },
]

/** Franja de recojo de 30 minutos que empieza ~20 minutos después de creado el pedido. */
export function franjaDemo(creadoEn: number): string {
  const inicio = new Date(creadoEn + 20 * MIN)
  inicio.setMinutes(inicio.getMinutes() < 30 ? 30 : 60, 0, 0)
  const fin = new Date(inicio.getTime() + 30 * MIN)
  const f = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${f(inicio)} – ${f(fin)}`
}

/** Minutos que avanzó el pedido desde su creación hasta su último cambio de estado. */
export const avanceDemo: Record<EstadoPedido, number> = { recibido: 0, preparando: 6, listo: 15, recogido: 30, cancelado: 5 }

type EncuestaDemo = Omit<RespuestaNps, 'fecha'> & { hace: number }

// Mezcla realista: promotores por la rapidez, pasivos y detractores por stock o atención.
// Canto Grande ≈ NPS 40 (bueno, con margen) y Vitarte ≈ NPS negativo para contrastar en el Panel.
const encuestasBase: EncuestaDemo[] = [
  { tiendaId: 't-sjl', pedidoId: 'P4JR5E', puntaje: 10, comentario: 'Recogí en 2 minutos, sin fila. ¡Buenazo!', hace: 80 },
  { tiendaId: 't-sjl', pedidoId: 'P3W1HF', puntaje: 9, comentario: 'Me avisaron por WhatsApp cuando estuvo listo.', hace: 3 * 24 * 60 },
  { tiendaId: 't-sjl', pedidoId: 'P3M6KG', puntaje: 8, comentario: 'Bien, pero faltó un producto y me lo cambiaron.', hace: 10 * 24 * 60 },
  { tiendaId: 't-sjl', puntaje: 10, comentario: 'Ya no pierdo mi hora de almuerzo en la cola.', hace: 2 * 24 * 60 },
  { tiendaId: 't-sjl', puntaje: 9, hace: 4 * 24 * 60 },
  { tiendaId: 't-sjl', puntaje: 10, comentario: 'Los precios son los mismos que en tienda.', hace: 5 * 24 * 60 },
  { tiendaId: 't-sjl', puntaje: 6, comentario: 'El arroz salía con stock pero ya no había.', hace: 6 * 24 * 60 },
  { tiendaId: 't-sjl', puntaje: 7, hace: 7 * 24 * 60 },
  { tiendaId: 't-sjl', puntaje: 9, comentario: 'Fácil de usar desde el celular.', hace: 8 * 24 * 60 },
  { tiendaId: 't-sjl', puntaje: 4, comentario: 'Tuve que esperar en el mostrador porque no estaba listo.', hace: 9 * 24 * 60 },
  { tiendaId: 't-comas', puntaje: 9, comentario: 'Compro por volumen para mi bodega y me ahorra tiempo.', hace: 2 * 24 * 60 },
  { tiendaId: 't-comas', puntaje: 8, hace: 5 * 24 * 60 },
  { tiendaId: 't-comas', puntaje: 10, hace: 6 * 24 * 60 },
  { tiendaId: 't-ate', puntaje: 5, comentario: 'Nadie sabía dónde era el mostrador de recojo.', hace: 1 * 24 * 60 },
  { tiendaId: 't-ate', puntaje: 3, comentario: 'Mi pedido demoró más que hacer la cola.', hace: 3 * 24 * 60 },
  { tiendaId: 't-ate', puntaje: 8, hace: 4 * 24 * 60 },
]

export const encuestasDemo = (ahora: number): RespuestaNps[] =>
  encuestasBase.map(({ hace, ...e }) => ({ ...e, fecha: ahora - hace * MIN }))
