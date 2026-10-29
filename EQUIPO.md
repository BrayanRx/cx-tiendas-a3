# Equipo y reparto

**Proceso crítico:** compra y pago en tienda en hora punta.
**Experiencia propuesta:** «Pide y recoge»: ver stock → pedir → pagar con QR → recoger sin fila, con un panel de tienda y un asistente IA en el back-stage.

Cada módulo responde a un punto de dolor del customer journey (Taller 2). Esa relación es la que se muestra en la presentación.

| Módulo | Responsable | Rama | Carpeta | Ruta | Dolor que resuelve |
|---|---|---|---|---|---|
| Base, inicio y Ubícanos | Brayan Rojas (líder) | `feat/base` | `features/home` | `/` | Poca presencia digital |
| Catálogo con stock | Ruth Amaya | `feat/catalogo` | `features/catalogo` | `/catalogo` | No sabe si hay stock |
| Pedido y pago | Nicole Auqui | `feat/pedido` | `features/pedido` | `/pedido` | Colas en caja |
| Seguimiento y recojo | Hemsy Cárdenas | `feat/seguimiento` | `features/seguimiento` | `/seguimiento` | Sin información ni postventa |
| Club 3A y NPS | Rafael Chu-lau | `feat/club` | `features/club` | `/club` | Fidelización solo por precio |
| Panel de tienda y asistente IA | Edison Rosales | `feat/panel` | `features/panel` | `/panel` | Atención desigual, quiebres de stock |
| Journey antes y después | Ruth Amaya | `feat/journey` | `features/journey` | `/journey` | El valor no se ve sin comparar con hoy |

> Si cambia un responsable, actualicen esta tabla y `src/config/equipo.ts`.
> El historial de qué se asignó y qué se hizo está en [BITACORA.md](BITACORA.md).

## Tareas por módulo

Marca `[x]` cuando una tarea esté en `main`. Cada responsable mantiene **solo su sección**.

### Brayan · Base, inicio y Ubícanos (líder)
- [x] Proyecto, rutas, layout, tokens de diseño, componentes compartidos y datos simulados
- [x] Página de inicio y selector de tienda
- [x] Conectar Vercel al repositorio
- [ ] Proteger `main` (exigir Pull Request)
- [ ] Datos de demostración (pedidos y encuestas de ejemplo)
- [ ] Componentes compartidos: código QR y aviso tipo WhatsApp
- [ ] Revisar y aprobar los PR de cada módulo
- [ ] Integración final y ensayo del recorrido completo

### Ruth · Catálogo con stock + Journey antes y después
Versión inicial del catálogo hecha por Rafael (grilla, stock, filtros, búsqueda, volumen, carrito). Ruth es la dueña del módulo desde aquí.
- [ ] Catálogo: revisar y pulir en celular (360 px)
- [ ] Catálogo: textos en tono cercano para el cliente
- [ ] Catálogo: aviso «avísame cuando llegue» en productos agotados
- [ ] Catálogo: sugerir el mismo producto en otra tienda cercana con stock
- [ ] Journey: las 7 etapas del customer journey (Taller 2) con acción, emoción y dolor de hoy
- [ ] Journey: por etapa, la pantalla de la app que lo resuelve (con enlace)
- [ ] Journey: curva de emoción antes vs. después
- [ ] Journey: conceptos del curso (momentos de la verdad, front-stage / back-stage)

### Nicole · Pedido y pago
- [ ] Revisión del carrito: cantidades, quitar, total
- [ ] Elegir franja de recojo de 30 minutos
- [ ] Método de pago: QR, tarjeta o pago en tienda
- [ ] Simular pago QR (código y confirmación)
- [ ] Crear el pedido con `crearPedido()` y redirigir a `/seguimiento/:id`
- [ ] Mostrar el tiempo ahorrado frente a hacer cola (usa `esperaCajaMin` de la tienda)

### Hemsy · Seguimiento y recojo
- [ ] Línea de tiempo: recibido → preparando → listo → recogido
- [ ] Código QR de recojo para el mostrador
- [ ] Vista previa de aviso tipo WhatsApp en cada estado
- [ ] Lista «Mis pedidos»
- [ ] Botón de reclamo o cambio (postventa)
- [ ] Al recoger, invitar a la encuesta NPS

### Rafael · Club 3A y NPS
- [x] Saldo de puntos y nivel del cliente
- [x] Cupones canjeables en marca propia
- [x] Historial de puntos por pedido
- [x] Encuesta NPS de 0 a 10 con comentario
- [x] Cómo ganar puntos
- [x] Extra: login simulado con roles cliente / administrador

### Edison · Panel de tienda y asistente IA
Versión inicial del panel hecha por Rafael (cola de pedidos, alertas de stock, KPIs, sugerencias fijas y comparativo antes/después). Edison es el dueño del módulo desde aquí. El taller pide una transformación **con IA**: el asistente es lo que la demuestra.
- [ ] Asistente en formato chat: el administrador pregunta y recibe respuestas
- [ ] Respuestas basadas en los datos del panel (colas, stock, NPS, pedidos), sin claves de API
- [ ] Preguntas sugeridas: «¿Qué hago ahora?», «¿Qué repongo?», «¿Abro otra caja?»
- [ ] Mostrar qué datos usó la IA para cada recomendación
- [ ] Opcional: modo presentación (recorrido guiado de la demo)

## Contrato compartido

Todos los módulos se comunican por `src/lib/store.ts`:

| Acción o dato | Lo escribe | Lo lee |
|---|---|---|
| `tiendaId`, `setTienda` | Inicio | Todos |
| `carrito`, `agregarAlCarrito` | Catálogo | Pedido, Layout |
| `crearPedido` | Pedido | Seguimiento, Panel, Club |
| `avanzarPedido` | Panel | Seguimiento |
| `puntos`, `canjearPuntos` | Pedido (suma), Club (canje) | Club |
| `registrarNps`, `encuestas` | Club / Seguimiento | Panel |

## Presentación (próxima semana)

Cada integrante prepara 1 a 2 diapositivas de su módulo con: dolor → solución → captura de pantalla → concepto del curso (journey, blueprint, 7P, NPS, KPI). El líder arma la introducción (proceso crítico) y el cierre (demo en vivo con el enlace de Vercel).

## Acceso simulado (login)

No hay backend: el login solo elige un rol y guarda `sesion` en `useApp` (sin contraseñas).

| Rol | Rutas | Notas |
|---|---|---|
| Visitante | `/`, `/catalogo`, `/login` | Puede ver stock; para pedir debe ingresar |
| Cliente | `/catalogo`, `/pedido`, `/seguimiento`, `/club` | Si entra a `/panel` vuelve a su inicio |
| Administrador de tienda | `/panel` | Elige la tienda que administra en la cabecera |

Las rutas protegidas se declaran en `src/App.tsx` con `RequireRol`.
