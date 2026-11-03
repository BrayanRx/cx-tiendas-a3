// Reparto de módulos. Fuente única: si cambia un responsable, se cambia aquí y en EQUIPO.md.

export type ModuloId = 'base' | 'catalogo' | 'pedido' | 'seguimiento' | 'club' | 'panel' | 'journey'

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
      'Revisar y pulir la versión actual en celular (360 px)',
      'Textos en tono cercano para el cliente',
      'Aviso "avísame cuando llegue" en productos agotados',
      'Sugerir el mismo producto en otra tienda cercana con stock',
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
      'Asistente IA en formato chat: el administrador pregunta y recibe respuestas',
      'Respuestas basadas en los datos del panel (colas, stock, NPS, pedidos)',
      'Preguntas sugeridas: "¿Qué hago ahora?", "¿Qué repongo?", "¿Abro otra caja?"',
      'Explicar en pantalla qué datos usó la IA para cada recomendación',
      'Opcional: modo presentación (recorrido guiado de la demo)',
    ],
  },
  {
    id: 'journey',
    nombre: 'Journey antes y después',
    ruta: '/journey',
    responsable: 'Ruth Amaya',
    rama: 'feat/journey',
    dolor: 'El valor de la propuesta no se ve si no se compara con la experiencia actual.',
    tareas: [
      'Las 7 etapas del customer journey de Tiendas 3A (Taller 2)',
      'Por etapa: acción del cliente, emoción y punto de dolor de hoy',
      'Por etapa: la pantalla de la app que lo resuelve, con enlace',
      'Curva de emoción antes vs. después',
      'Conceptos del curso: momentos de la verdad, front-stage / back-stage',
    ],
  },
]

export const getModulo = (id: ModuloId) => modulos.find((m) => m.id === id)!
