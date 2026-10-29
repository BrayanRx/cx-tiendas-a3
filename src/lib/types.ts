// Tipos compartidos por todos los módulos. Cambiarlos afecta a todo el equipo:
// coordina con el líder antes de modificar un tipo existente (agregar campos opcionales sí está bien).

export type Distrito = 'Lima Cercado' | 'San Juan de Lurigancho' | 'Comas' | 'Ate' | 'Villa El Salvador' | 'Puente Piedra'

export interface Tienda {
  id: string
  nombre: string
  direccion: string
  distrito: Distrito
  horario: string
  /** Minutos de espera estimados en caja, según hora del día (simulado). */
  esperaCajaMin: number
}

export type Categoria = 'abarrotes' | 'lacteos' | 'limpieza' | 'cuidado-personal' | 'bebidas' | 'frescos'

export interface Producto {
  id: string
  nombre: string
  marca: string
  /** true si es marca propia de la cadena (propuesta de valor: precio bajo con calidad garantizada). */
  marcaPropia: boolean
  categoria: Categoria
  presentacion: string
  precio: number
  /** Precio por volumen para bodegueros (desde `volumenMin` unidades). */
  precioVolumen?: number
  volumenMin?: number
  /** Emoji como imagen provisional; se puede reemplazar por una ruta en /public. */
  imagen: string
  /** Foto real en /public/productos (ver CREDITOS.md). Si falta o no carga, se usa el emoji. */
  foto?: string
}

/** Stock por tienda: stock[tiendaId][productoId] = unidades. */
export type StockPorTienda = Record<string, Record<string, number>>

export interface ItemCarrito {
  productoId: string
  cantidad: number
}

export type EstadoPedido = 'recibido' | 'preparando' | 'listo' | 'recogido' | 'cancelado'

export type MetodoPago = 'qr' | 'tarjeta' | 'efectivo-en-tienda'

export interface Pedido {
  id: string
  tiendaId: string
  items: ItemCarrito[]
  total: number
  /** Franja de recojo elegida, ej. "18:00 – 18:30". */
  franja: string
  metodoPago: MetodoPago
  estado: EstadoPedido
  creadoEn: number
  actualizadoEn: number
  puntosGanados: number
}

export interface RespuestaNps {
  pedidoId?: string
  tiendaId: string
  /** 0 a 10 */
  puntaje: number
  comentario?: string
  fecha: number
}

export type RolSesion = 'cliente' | 'admin'

/** Sesión simulada (sin backend ni contraseñas). */
export interface Sesion {
  rol: RolSesion
  nombre: string
}
