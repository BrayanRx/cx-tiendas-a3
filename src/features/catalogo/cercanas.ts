import { getTienda, stock } from '@/data/tiendas'
import type { Tienda } from '@/lib/types'

// Tiendas vecinas de cada una, de la más cercana a la más lejana (orden aproximado por distritos).
// Las tiendas simuladas no tienen coordenadas, por eso la cercanía se define a mano aquí.
const CERCANAS: Record<string, string[]> = {
  't-sjl': ['t-lima', 't-ate', 't-comas'],
  't-comas': ['t-pp', 't-sjl', 't-lima'],
  't-ate': ['t-sjl', 't-lima', 't-ves'],
  't-ves': ['t-ate', 't-lima'],
  't-pp': ['t-comas', 't-sjl'],
  't-lima': ['t-sjl', 't-comas', 't-ate'],
}

export interface Alternativa {
  tienda: Tienda
  unidades: number
}

/** Primera tienda cercana que sí tiene el producto, o null si ninguna lo tiene. */
export function alternativaCercana(productoId: string, tiendaId: string): Alternativa | null {
  for (const id of CERCANAS[tiendaId] ?? []) {
    const unidades = stock[id]?.[productoId] ?? 0
    const tienda = getTienda(id)
    if (tienda && unidades > 0) return { tienda, unidades }
  }
  return null
}
