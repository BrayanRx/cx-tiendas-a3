// Datos simulados del Club 3A: niveles, cupones canjeables y reglas para ganar puntos.

export interface Nivel {
  id: 'bronce' | 'plata' | 'oro'
  nombre: string
  /** Puntos acumulados mínimos para alcanzar el nivel. */
  desde: number
  beneficio: string
}

export const niveles: Nivel[] = [
  { id: 'bronce', nombre: 'Bronce', desde: 0, beneficio: 'Acumulas 1 punto por cada S/ 1 en tus pedidos.' },
  { id: 'plata', nombre: 'Plata', desde: 300, beneficio: 'Acceso anticipado a cupones de marca propia.' },
  { id: 'oro', nombre: 'Oro', desde: 800, beneficio: 'Atención prioritaria en el mostrador «Pide y recoge».' },
]

export interface Cupon {
  id: string
  titulo: string
  detalle: string
  costo: number
  marca: string
  imagen: string
}

export const cupones: Cupon[] = [
  { id: 'cup-arroz', titulo: 'S/ 3 de descuento', detalle: 'En Arroz extra 5 kg', costo: 60, marca: 'Don Chef', imagen: '🍚' },
  { id: 'cup-leche', titulo: '2x1 en 2ª unidad', detalle: 'En Leche evaporada 400 g', costo: 90, marca: 'Bianca', imagen: '🥛' },
  { id: 'cup-detergente', titulo: '15 % de descuento', detalle: 'En Detergente en polvo 2 kg', costo: 150, marca: 'Lavalu', imagen: '🧺' },
  { id: 'cup-papel', titulo: 'S/ 5 de descuento', detalle: 'En Papel higiénico 12 rollos', costo: 200, marca: 'Cloudy', imagen: '🧻' },
]

export const formasDeGanar = [
  { titulo: 'Compra y recoge', detalle: 'Ganas 1 punto por cada S/ 1 de tu pedido «Pide y recoge».', imagen: '🛒' },
  { titulo: 'Elige marca propia', detalle: 'Canjea tus puntos por cupones en Don Chef, Bianca, Lavalu y más.', imagen: '🏷️' },
  { titulo: 'Cuéntanos tu experiencia', detalle: 'Tu opinión nos ayuda a mejorar cada tienda.', imagen: '💬' },
]
