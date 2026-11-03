import type { ItemCarrito } from '@/lib/types'

// Canastas armadas para el cliente principal (compra semanal o quincenal) y para el bodeguero (compra por volumen).
// Un toque agrega todos sus productos al carrito; los precios salen del catálogo (precio por volumen incluido).

export interface Canasta {
  id: string
  nombre: string
  /** Para quién está pensada, en una frase corta. */
  para: string
  emoji: string
  items: ItemCarrito[]
}

export const canastas: Canasta[] = [
  {
    id: 'semanal',
    nombre: 'Canasta semanal',
    para: 'Lo básico para una familia de 4 durante la semana.',
    emoji: '🧺',
    items: [
      { productoId: 'arroz-5kg', cantidad: 1 },
      { productoId: 'aceite-1l', cantidad: 1 },
      { productoId: 'azucar-1kg', cantidad: 1 },
      { productoId: 'fideos-500', cantidad: 2 },
      { productoId: 'leche-400', cantidad: 6 },
      { productoId: 'huevos-15', cantidad: 1 },
      { productoId: 'papa-1kg', cantidad: 2 },
      { productoId: 'pollo-1kg', cantidad: 1 },
    ],
  },
  {
    id: 'quincenal',
    nombre: 'Canasta quincenal',
    para: 'Abarrotes y limpieza para dos semanas, en una sola compra.',
    emoji: '🛒',
    items: [
      { productoId: 'arroz-5kg', cantidad: 2 },
      { productoId: 'aceite-1l', cantidad: 2 },
      { productoId: 'azucar-1kg', cantidad: 2 },
      { productoId: 'fideos-500', cantidad: 4 },
      { productoId: 'atun-170', cantidad: 4 },
      { productoId: 'avena-900', cantidad: 1 },
      { productoId: 'leche-400', cantidad: 12 },
      { productoId: 'detergente-2kg', cantidad: 1 },
      { productoId: 'lejia-1l', cantidad: 1 },
      { productoId: 'papel-12', cantidad: 1 },
    ],
  },
  {
    id: 'bodeguero',
    nombre: 'Pack bodeguero',
    para: 'Para reponer tu bodega con precio por volumen.',
    emoji: '🏪',
    items: [
      { productoId: 'arroz-5kg', cantidad: 6 },
      { productoId: 'aceite-1l', cantidad: 12 },
      { productoId: 'azucar-1kg', cantidad: 12 },
      { productoId: 'leche-400', cantidad: 24 },
    ],
  },
]
