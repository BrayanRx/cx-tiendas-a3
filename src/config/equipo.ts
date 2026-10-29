// Reparto de módulos. Fuente única: si cambia un responsable, se cambia aquí y en EQUIPO.md.

export type ModuloId = 'base' | 'catalogo' | 'pedido' | 'seguimiento' | 'club' | 'panel'

export interface Modulo {
  id: ModuloId
  nombre: string
  ruta: string
  responsable: string
  rama: string
  dolor: string
  tareas: string[]
}

export const modulos: Modulo[] = [
  {
    id: 'base',
    nombre: 'Base, inicio y Ubícanos',
    ruta: '/',
    responsable: 'Brayan Rojas (líder)',
    rama: 'feat/base',
    dolor: 'Poca presencia digital: el cliente no descubre ni ubica la tienda.',
    tareas: ['Layout y navegación', 'Página de inicio con propuesta de valor', 'Selector de tienda (Ubícanos)', 'Revisión de PRs y despliegue'],
  },
  {
    id: 'catalogo',
    nombre: 'Catálogo con stock',
    ruta: '/catalogo',
    responsable: 'Ruth Amaya',
    rama: 'feat/catalogo',
    dolor: 'No sabe si el producto está en stock antes de ir.',
    tareas: [
      'Grilla de productos con precio y stock de la tienda elegida',
      'Filtros por categoría y "solo marca propia"',
      'Búsqueda por nombre',
      'Botón agregar al carrito (deshabilitado si stock = 0)',
      'Aviso de precio por volumen para bodegueros',
      'Resumen del carrito con botón "Continuar al pedido"',
    ],
  },
  {
    id: 'pedido',
    nombre: 'Pedido y pago',
    ruta: '/pedido',
    responsable: 'Nicole Auqui',
    rama: 'feat/pedido',
    dolor: 'Colas largas en caja en hora punta.',
    tareas: [
      'Revisión del carrito (cantidades, quitar, total)',
      'Elegir franja de recojo de 30 min (hoy)',
      'Elegir método de pago: QR, tarjeta o pago en tienda',
      'Simular pago QR (código + confirmación)',
      'Crear el pedido con crearPedido() y redirigir a /seguimiento/:id',
      'Mostrar ahorro de tiempo vs. hacer cola',
    ],
  },
  {
    id: 'seguimiento',
    nombre: 'Seguimiento y recojo',
    ruta: '/seguimiento',
    responsable: 'Hemsy Cárdenas',
    rama: 'feat/seguimiento',
    dolor: 'Sin información del pedido ni canal de postventa.',
    tareas: [
      'Línea de tiempo: recibido → preparando → listo → recogido',
      'Código de recojo (QR) para el mostrador "Pide y recoge"',
      'Vista previa de aviso tipo WhatsApp en cada cambio de estado',
      'Lista de mis pedidos',
      'Botón de reclamo o cambio (postventa)',
      'Al recoger: invitar a la encuesta NPS',
    ],
  },
  {
    id: 'club',
    nombre: 'Club 3A y NPS',
    ruta: '/club',
    responsable: 'Rafael Chu-lau',
    rama: 'feat/club',
    dolor: 'Fidelización solo por precio, sin programa de puntos.',
    tareas: [
      'Saldo de puntos y nivel del cliente',
      'Cupones canjeables (marca propia)',
      'Historial de puntos ganados por pedido',
      'Encuesta NPS 0–10 con comentario',
      'Explicación de cómo ganar puntos',
    ],
  },
  {
    id: 'panel',
    nombre: 'Panel de tienda y asistente IA',
    ruta: '/panel',
    responsable: 'Edison Rosales',
    rama: 'feat/panel',
    dolor: 'Atención desigual y quiebres de stock sin aviso.',
    tareas: [
      'Cola de pedidos por estado con botón "avanzar"',
      'Alertas de quiebre de stock de la tienda',
      'KPIs: tiempo en cola, pedidos del día, NPS, recompra',
      'Asistente IA (simulado) que sugiere acciones: abrir caja, reponer',
      'Comparativo antes / después para la presentación',
    ],
  },
]

export const getModulo = (id: ModuloId) => modulos.find((m) => m.id === id)!
