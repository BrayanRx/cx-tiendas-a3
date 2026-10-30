// Las 7 etapas del customer journey de Tiendas 3A. Cada etapa nace de un punto de dolor del cliente de hoy
// y se enlaza con la pantalla de la app que lo resuelve. La emoción va de 1 (frustrado) a 5 (encantado).

export interface Etapa {
  id: number
  nombre: string
  /** Momento de la verdad: la interacción donde el cliente forma su opinión de la tienda. */
  momentoVerdad: boolean
  accion: string
  dolor: string
  emocionAntes: number
  emocionDespues: number
  solucion: string
  ruta: string
  pantalla: string
  /** Blueprint: lo que ve el cliente (front-stage) y lo que ocurre detrás (back-stage). */
  front: string
  back: string
}

export const etapas: Etapa[] = [
  {
    id: 1,
    nombre: 'Descubrir la tienda',
    momentoVerdad: false,
    accion: 'Busca dónde comprar su canasta. Se entera por el barrio o al pasar por la puerta.',
    dolor: 'Poca presencia digital: no sabe qué tiendas hay cerca ni su horario.',
    emocionAntes: 2,
    emocionDespues: 4,
    solucion: 'Inicio con selector de tienda (Ubícanos): dirección, horario y espera en caja de hoy.',
    ruta: '/',
    pantalla: 'Inicio y Ubícanos',
    front: 'Ve las tiendas cercanas con su horario y cuánto se demora la caja.',
    back: 'Datos de tiendas y tiempos de caja mantenidos por el equipo de la cadena.',
  },
  {
    id: 2,
    nombre: 'Saber si hay stock',
    momentoVerdad: true,
    accion: 'Se pregunta si encontrará lo que necesita antes de gastar pasaje y tiempo.',
    dolor: 'No sabe si hay stock: va a la tienda y a veces regresa sin el producto.',
    emocionAntes: 1,
    emocionDespues: 4,
    solucion: 'Catálogo con el stock de su tienda y aviso «agotado en esta tienda».',
    ruta: '/catalogo',
    pantalla: 'Catálogo con stock',
    front: 'Ve cuántas unidades quedan de cada producto antes de salir de casa.',
    back: 'Inventario por tienda alimenta el catálogo y las alertas de quiebre del panel.',
  },
  {
    id: 3,
    nombre: 'Armar la compra',
    momentoVerdad: false,
    accion: 'Recorre pasillos comparando precios y marcas para que le alcance el presupuesto.',
    dolor: 'Señalización y precios confusos: cuesta ver cuánto ahorra con la marca propia.',
    emocionAntes: 2,
    emocionDespues: 4,
    solucion: 'Precios claros, filtro «solo marca propia» y precio por volumen para bodegueros.',
    ruta: '/catalogo',
    pantalla: 'Catálogo y carrito',
    front: 'Filtra, compara y ve el total de su carrito mientras elige.',
    back: 'Política de precios y marcas propias cargada en el catálogo.',
  },
  {
    id: 4,
    nombre: 'Pagar en caja',
    momentoVerdad: true,
    accion: 'Hace fila para pagar, justo en hora punta, cuando menos tiempo tiene.',
    dolor: 'Colas largas en caja: pierde tiempo y se va con mal sabor de boca.',
    emocionAntes: 1,
    emocionDespues: 5,
    solucion: 'Pedido anticipado con franja de recojo de 30 minutos y pago con QR.',
    ruta: '/pedido',
    pantalla: 'Pedido y pago',
    front: 'Elige su franja, paga con QR y se olvida de la fila.',
    back: 'El pedido llega al panel de tienda antes de que el cliente salga de casa.',
  },
  {
    id: 5,
    nombre: 'Recoger y ser atendido',
    momentoVerdad: true,
    accion: 'Llega a retirar su pedido o pide ayuda al personal del mostrador.',
    dolor: 'Atención desigual entre tiendas y ninguna información de cómo va su pedido.',
    emocionAntes: 2,
    emocionDespues: 4,
    solucion: 'Seguimiento en vivo, QR de recojo y avisos tipo WhatsApp en cada estado.',
    ruta: '/seguimiento',
    pantalla: 'Seguimiento y recojo',
    front: 'Muestra su código en el mostrador «Pide y recoge» y se va con su pedido listo.',
    back: 'Panel de tienda ordena la cola por estado y el asistente IA sugiere qué priorizar.',
  },
  {
    id: 6,
    nombre: 'Reclamar o cambiar',
    momentoVerdad: false,
    accion: 'Algo salió mal con un producto o con el cobro y quiere que lo solucionen.',
    dolor: 'Sin canal de reclamos: tiene que volver a la tienda y explicar todo de nuevo.',
    emocionAntes: 1,
    emocionDespues: 4,
    solucion: 'Botón de reclamo o cambio dentro del seguimiento del pedido.',
    ruta: '/seguimiento',
    pantalla: 'Seguimiento (postventa)',
    front: 'Reporta el problema desde el celular, sobre el mismo pedido.',
    back: 'El reclamo queda asociado al pedido y a la tienda para su atención.',
  },
  {
    id: 7,
    nombre: 'Volver a comprar',
    momentoVerdad: false,
    accion: 'Decide si regresa a la misma tienda en su próxima compra quincenal.',
    dolor: 'Fidelización solo por precio: nada lo une a la marca si otra tienda baja un sol.',
    emocionAntes: 3,
    emocionDespues: 5,
    solucion: 'Club 3A: puntos por pedido, cupones en marca propia y encuesta NPS.',
    ruta: '/club',
    pantalla: 'Club 3A y NPS',
    front: 'Ve su saldo, canjea cupones y califica su experiencia.',
    back: 'Las encuestas NPS alimentan los indicadores del panel de tienda.',
  },
]

export const EMOCIONES: Record<number, { emoji: string; etiqueta: string }> = {
  1: { emoji: '😠', etiqueta: 'Frustrado' },
  2: { emoji: '😕', etiqueta: 'Molesto' },
  3: { emoji: '😐', etiqueta: 'Neutral' },
  4: { emoji: '🙂', etiqueta: 'Contento' },
  5: { emoji: '😄', etiqueta: 'Encantado' },
}

export const promedio = (valores: number[]) => valores.reduce((a, b) => a + b, 0) / valores.length
