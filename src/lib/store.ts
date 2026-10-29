import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { productos } from '@/data/productos'
import { tiendas } from '@/data/tiendas'
import type { EstadoPedido, ItemCarrito, MetodoPago, Pedido, RespuestaNps, Sesion } from './types'

// Estado global compartido entre módulos, guardado en el navegador (localStorage).
// Es el "contrato" del equipo: cada módulo lee y escribe aquí en vez de inventar su propio estado.
// Si necesitas una acción nueva, agrégala al final de su grupo y avisa en el PR.

const PUNTOS_POR_SOL = 1
const ORDEN_ESTADOS: EstadoPedido[] = ['recibido', 'preparando', 'listo', 'recogido']

export const precioUnitario = (productoId: string, cantidad: number) => {
  const p = productos.find((x) => x.id === productoId)
  if (!p) return 0
  return p.precioVolumen && p.volumenMin && cantidad >= p.volumenMin ? p.precioVolumen : p.precio
}

export const totalItems = (items: ItemCarrito[]) =>
  Math.round(items.reduce((s, i) => s + precioUnitario(i.productoId, i.cantidad) * i.cantidad, 0) * 100) / 100

interface AppState {
  // Tienda elegida por el cliente (Home / Ubícanos)
  tiendaId: string
  setTienda: (id: string) => void

  // Carrito (Catálogo)
  carrito: ItemCarrito[]
  agregarAlCarrito: (productoId: string, cantidad?: number) => void
  cambiarCantidad: (productoId: string, cantidad: number) => void
  quitarDelCarrito: (productoId: string) => void
  vaciarCarrito: () => void

  // Pedidos (Pedido y pago → Seguimiento → Panel)
  pedidos: Pedido[]
  crearPedido: (datos: { franja: string; metodoPago: MetodoPago }) => Pedido | null
  avanzarPedido: (id: string) => void
  cancelarPedido: (id: string) => void

  // Club 3A (puntos y encuesta NPS)
  puntos: number
  canjearPuntos: (cantidad: number) => boolean
  encuestas: RespuestaNps[]
  registrarNps: (r: Omit<RespuestaNps, 'fecha'>) => void

  // Sesión simulada (Acceso): cliente o administrador de tienda
  sesion: Sesion | null
  iniciarSesion: (sesion: Sesion) => void
  cerrarSesion: () => void

  // Utilidad para demos
  reiniciarDemo: () => void
}

const inicial = {
  tiendaId: tiendas[0].id,
  carrito: [] as ItemCarrito[],
  pedidos: [] as Pedido[],
  puntos: 120,
  encuestas: [] as RespuestaNps[],
}

const sesionInicial = null as Sesion | null

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...inicial,
      sesion: sesionInicial,

      setTienda: (id) => set({ tiendaId: id }),

      agregarAlCarrito: (productoId, cantidad = 1) =>
        set((s) => {
          const existe = s.carrito.find((i) => i.productoId === productoId)
          return {
            carrito: existe
              ? s.carrito.map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad + cantidad } : i))
              : [...s.carrito, { productoId, cantidad }],
          }
        }),
      cambiarCantidad: (productoId, cantidad) =>
        set((s) => ({
          carrito:
            cantidad <= 0
              ? s.carrito.filter((i) => i.productoId !== productoId)
              : s.carrito.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i)),
        })),
      quitarDelCarrito: (productoId) => set((s) => ({ carrito: s.carrito.filter((i) => i.productoId !== productoId) })),
      vaciarCarrito: () => set({ carrito: [] }),

      crearPedido: ({ franja, metodoPago }) => {
        const { carrito, tiendaId } = get()
        if (!carrito.length) return null
        const total = totalItems(carrito)
        const ahora = Date.now()
        const pedido: Pedido = {
          id: 'P' + ahora.toString(36).toUpperCase().slice(-6),
          tiendaId,
          items: carrito,
          total,
          franja,
          metodoPago,
          estado: 'recibido',
          creadoEn: ahora,
          actualizadoEn: ahora,
          puntosGanados: Math.floor(total * PUNTOS_POR_SOL),
        }
        set((s) => ({ pedidos: [pedido, ...s.pedidos], carrito: [], puntos: s.puntos + pedido.puntosGanados }))
        return pedido
      },
      avanzarPedido: (id) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) => {
            if (p.id !== id) return p
            const i = ORDEN_ESTADOS.indexOf(p.estado)
            if (i < 0 || i === ORDEN_ESTADOS.length - 1) return p
            return { ...p, estado: ORDEN_ESTADOS[i + 1], actualizadoEn: Date.now() }
          }),
        })),
      cancelarPedido: (id) =>
        set((s) => ({
          pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, estado: 'cancelado', actualizadoEn: Date.now() } : p)),
        })),

      canjearPuntos: (cantidad) => {
        if (get().puntos < cantidad) return false
        set((s) => ({ puntos: s.puntos - cantidad }))
        return true
      },
      registrarNps: (r) => set((s) => ({ encuestas: [...s.encuestas, { ...r, fecha: Date.now() }] })),

      iniciarSesion: (sesion) => set({ sesion }),
      cerrarSesion: () => set({ sesion: null }),

      // La sesión no se reinicia: la demo conserva quién está conectado.
      reiniciarDemo: () => set({ ...inicial }),
    }),
    { name: 'cx-pide-y-recoge', version: 1 },
  ),
)
