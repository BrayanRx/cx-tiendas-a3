// Las 7 etapas del Customer Journey Map de Tiendas 3A, tal como están en el Taller 2 (lámina 7).
// Acción, nombre de la etapa, dolor y emoción de «Hoy» salen del Taller; «Con Pide y recoge» es lo que aporta la app
// y se enlaza con la pantalla que resuelve ese dolor. La emoción numérica va de 1 (frustrado) a 5 (encantado) y sirve
// para dibujar la curva: `emocionHoy` guarda la palabra exacta que usa el Taller.
// El Taller marca cada emoción con tres niveles de color, y de ahí sale el número de «Hoy»:
// naranja = negativa (Frustración 1, Confusión 2) · gris = neutral (Duda 3) · contorno blanco = positiva (4).

export interface Etapa {
  id: number
  nombre: string
  /** Momento de la verdad: la interacción donde el cliente forma su opinión de la tienda. */
  momentoVerdad: boolean
  accion: string
  dolor: string
  /** Emoción de «Hoy» con la palabra del Taller 2 (Curiosidad, Duda, Grata sorpresa…). */
  emocionHoy: string
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
    nombre: 'Descubrimiento',
    momentoVerdad: false,
    accion: 'Ve publicidad o pasa cerca de una tienda 3A.',
    dolor: 'No puede ver precios ni ofertas antes de ir: la presencia digital es poca.',
    emocionHoy: 'Curiosidad',
    emocionAntes: 4,
    emocionDespues: 5,
    solucion: 'Inicio con canastas armadas, lo más pedido y promociones con precio claro, y selector de tienda (Ubícanos) con dirección, horario y espera en caja.',
    ruta: '/',
    pantalla: 'Inicio y Ubícanos',
    front: 'Ve precios, ofertas y su tienda más cercana desde el celular, antes de salir de casa.',
    back: 'El equipo de la cadena mantiene precios, promociones y datos de cada tienda.',
  },
  {
    id: 2,
    nombre: 'Decisión de visita',
    momentoVerdad: true,
    accion: 'Compara precio y cercanía frente a otras opciones.',
    dolor: 'No sabe si el producto que busca está en stock: puede gastar pasaje y tiempo y volver sin él.',
    emocionHoy: 'Duda',
    emocionAntes: 3,
    emocionDespues: 4,
    solucion: 'Catálogo con el stock de su tienda, aviso «agotado en esta tienda» y sugerencia de otra tienda cercana que sí tiene el producto.',
    ruta: '/catalogo',
    pantalla: 'Catálogo con stock',
    front: 'Ve cuántas unidades quedan de cada producto antes de salir de casa.',
    back: 'Inventario por tienda alimenta el catálogo y las alertas de quiebre del panel.',
  },
  {
    id: 3,
    nombre: 'Llegada y exploración',
    momentoVerdad: true,
    accion: 'Entra a la tienda y recorre los anaqueles.',
    dolor: 'Atención desigual: personal nuevo y poco capacitado; la experiencia cambia de una tienda a otra.',
    emocionHoy: 'Grata sorpresa',
    emocionAntes: 4,
    emocionDespues: 5,
    solucion: 'Con el pedido listo llega directo al mostrador «Pide y recoge», sin recorrer anaqueles: muestra su código QR y lo atienden igual en todas las tiendas.',
    ruta: '/seguimiento',
    pantalla: 'Seguimiento y recojo',
    front: 'Muestra su código en el mostrador «Pide y recoge» y se va con su pedido armado.',
    back: 'El panel de tienda ordena la cola por franja y el asistente IA sugiere qué priorizar, para atender igual en todas las tiendas.',
  },
  {
    id: 4,
    nombre: 'Selección y comparación',
    momentoVerdad: false,
    accion: 'Compara marca propia vs. conocida y revisa promociones.',
    dolor: 'Señalización confusa de precios y quiebres de stock: cuesta ver cuánto ahorra con la marca propia.',
    emocionHoy: 'Confusión',
    emocionAntes: 2,
    emocionDespues: 4,
    solucion: 'Precios claros en el catálogo, filtro «solo marca propia», precio por volumen para bodegueros y carrito con el total a la vista.',
    ruta: '/catalogo',
    pantalla: 'Catálogo y carrito',
    front: 'Filtra, compara y ve el total de su carrito mientras elige.',
    back: 'Política de precios y marcas propias cargada en el catálogo; las alertas del panel avisan antes de que falte un producto.',
  },
  {
    id: 5,
    nombre: 'Pago en caja',
    momentoVerdad: true,
    accion: 'Hace fila y paga en caja.',
    dolor: 'Colas largas en horas punta por dotación reducida: pierde tiempo y se va con mal sabor de boca.',
    emocionHoy: 'Frustración',
    emocionAntes: 1,
    emocionDespues: 5,
    solucion: 'Pedido anticipado con franja de recojo de 30 minutos y pago con QR, sin pasar por la fila de caja.',
    ruta: '/pedido',
    pantalla: 'Pedido y pago',
    front: 'Elige su franja, paga con QR y se olvida de la fila.',
    back: 'El pedido llega al panel de tienda antes de que el cliente salga de casa, así la caja no se satura en hora punta.',
  },
  {
    id: 6,
    nombre: 'Salida y uso',
    momentoVerdad: false,
    accion: 'Lleva los productos a casa y los consume; si algo no está bien, necesita cambiarlo o consultar.',
    dolor: 'Cambios y consultas solo en tienda: sin chat ni teléfono, tiene que volver y explicar todo de nuevo.',
    emocionHoy: 'Alivio',
    emocionAntes: 4,
    emocionDespues: 5,
    solucion: 'Botón de reclamo o cambio dentro del seguimiento del pedido, sin volver a la tienda.',
    ruta: '/seguimiento',
    pantalla: 'Seguimiento (postventa)',
    front: 'Reporta el problema desde el celular, sobre el mismo pedido.',
    back: 'La tienda responde por WhatsApp en menos de 24 horas. En el prototipo el reclamo se simula en la pantalla: todavía no llega al panel.',
  },
  {
    id: 7,
    nombre: 'Recompra y fidelización',
    momentoVerdad: false,
    accion: 'Vuelve a comprar o recomienda la tienda.',
    dolor: 'El Club 3A no acumula puntos por recompra: hoy fideliza casi solo por precio.',
    emocionHoy: 'Confianza',
    emocionAntes: 4,
    emocionDespues: 5,
    solucion: 'Club 3A con puntos por pedido, cupones en marca propia y encuesta NPS al recoger.',
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
