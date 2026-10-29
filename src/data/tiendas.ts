import type { StockPorTienda, Tienda } from '@/lib/types'
import { productos } from './productos'

// Datos simulados para el prototipo. Direcciones y tiempos son ficticios.
export const tiendas: Tienda[] = [
  { id: 't-sjl', nombre: 'Tienda Canto Grande', direccion: 'Av. Próceres de la Independencia 1820', distrito: 'San Juan de Lurigancho', horario: '7:00 – 22:00', esperaCajaMin: 14 },
  { id: 't-comas', nombre: 'Tienda Túpac Amaru', direccion: 'Av. Túpac Amaru 4410', distrito: 'Comas', horario: '7:00 – 22:00', esperaCajaMin: 11 },
  { id: 't-ate', nombre: 'Tienda Vitarte', direccion: 'Carretera Central km 7.5', distrito: 'Ate', horario: '7:00 – 22:00', esperaCajaMin: 9 },
  { id: 't-ves', nombre: 'Tienda Pachacámac', direccion: 'Av. Pachacútec 3150', distrito: 'Villa El Salvador', horario: '7:00 – 21:30', esperaCajaMin: 12 },
  { id: 't-pp', nombre: 'Tienda Puente Piedra', direccion: 'Panamericana Norte km 31', distrito: 'Puente Piedra', horario: '7:00 – 21:30', esperaCajaMin: 8 },
  { id: 't-lima', nombre: 'Tienda Cercado', direccion: 'Jr. Ica 455', distrito: 'Lima Cercado', horario: '8:00 – 21:00', esperaCajaMin: 6 },
]

// Stock pseudoaleatorio pero estable (mismo resultado en cada carga), con algunos quiebres a propósito.
const semilla = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)

export const stock: StockPorTienda = Object.fromEntries(
  tiendas.map((t) => [
    t.id,
    Object.fromEntries(
      productos.map((p) => {
        const n = semilla(t.id + p.id) % 40
        return [p.id, n < 5 ? 0 : n]
      }),
    ),
  ]),
)

export const getTienda = (id: string) => tiendas.find((t) => t.id === id)
