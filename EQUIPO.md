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
- [x] Proteger `main` (exigir Pull Request)
- [x] Datos de demostración (pedidos y encuestas de ejemplo)
- [x] Componentes compartidos: código QR y aviso tipo WhatsApp
- [ ] Pedirle a Hemsy que use `@/components/CodigoQr` y `AvisoWhatsapp` en vez de sus copias locales, y a Nicole que use el QR para el pago
- [ ] Revisar y aprobar los PR de cada módulo
- [ ] Integración final y ensayo del recorrido completo
- [ ] Presentación: introducción (proceso crítico) y cierre (demo en vivo del recorrido del cliente)
- [x] Rediseño de la base: tipografía, botones y tarjetas, cabecera, pie de página con «Antes y después» e Inicio con canastas armadas y opiniones NPS

### Ruth · Catálogo con stock + Journey antes y después
Versión inicial del catálogo hecha por Rafael (grilla, stock, filtros, búsqueda, volumen, carrito). Ruth es la dueña del módulo desde aquí.
- [x] Catálogo: revisar y pulir en celular (360 px)
- [x] Catálogo: textos en tono cercano para el cliente
- [x] Catálogo: aviso «avísame cuando llegue» en productos agotados
- [x] Catálogo: sugerir el mismo producto en otra tienda cercana con stock

Las 4 tareas de Catálogo las hizo Rafael por encargo (PR de `feat/catalogo-pulido`, apilado sobre las fotos del PR #4). «Avísame cuando llegue» es simulado y vive solo en la pantalla; la cercanía entre tiendas se define a mano en `src/features/catalogo/cercanas.ts`.
- [x] Journey: las 7 etapas del customer journey (Taller 2) con acción, emoción y dolor de hoy
- [x] Journey: por etapa, la pantalla de la app que lo resuelve (con enlace)
- [x] Journey: curva de emoción antes vs. después
- [x] Journey: conceptos del curso (momentos de la verdad, front-stage / back-stage)

Las 4 tareas de Journey las hizo Rafael por encargo (PR de `feat/journey-pagina`). Las 7 etapas salen de los 7 puntos de dolor del cliente (`AGENTS.md`): Ruth debe contrastarlas con su Taller 2 y ajustar `src/features/journey/etapas.ts` si difieren.
- [ ] Journey: validar las 7 etapas y emociones con el Taller 2 (se defiende en vivo)

### Nicole · Pedido y pago
- [x] Revisión del carrito: cantidades, quitar, total
- [x] Elegir franja de recojo de 30 minutos
- [x] Método de pago: QR, tarjeta o pago en tienda
- [x] Simular pago QR (código y confirmación)
- [x] Crear el pedido con `crearPedido()` y redirigir a `/seguimiento/:id`
- [x] Mostrar el tiempo ahorrado frente a hacer cola (usa `esperaCajaMin` de la tienda)
- [x] Ajustes de la revisión del PR #6: tildes y signos (¿Cuándo…?, catálogo, débito…), recojo de 2 min igual que el Panel, descripción de tarjeta coherente con Seguimiento, franja en formato 24 h y que empiece al menos 20 min después
- [x] Usar el QR compartido `@/components/CodigoQr` en el pago (en vez de `PATRON_QR`)

### Hemsy · Seguimiento y recojo
- [x] Línea de tiempo: recibido → preparando → listo → recogido
- [x] Código QR de recojo para el mostrador
- [x] Vista previa de aviso tipo WhatsApp en cada estado
- [x] Lista «Mis pedidos»
- [x] Botón de reclamo o cambio (postventa)
- [x] Al recoger, invitar a la encuesta NPS
- [x] Extra: «Antes / ahora» en Mis pedidos para dejar claro el dolor que resuelve
- [x] Extra: el estado se actualiza solo si el Panel avanza el pedido en otra pestaña
- [ ] Usar los componentes compartidos `@/components/CodigoQr` y `@/components/AvisoWhatsapp` en vez de las copias locales

### Rafael · Club 3A y NPS
- [x] Saldo de puntos y nivel del cliente
- [x] Cupones canjeables en marca propia
- [x] Historial de puntos por pedido
- [x] Encuesta NPS de 0 a 10 con comentario
- [x] Cómo ganar puntos
- [x] Extra: login simulado con roles cliente / administrador
- [x] Extra: fotos reales en el catálogo
- [ ] Fotos genéricas sin marca para los 9 productos que hoy usan emoji (aceite, leche, yogurt, gaseosa, agua, detergente, lejía, papel y pañales)

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
| `cargarDemo`, `reiniciarDemo` | Inicio (modo demostración) | Todos |

Componentes compartidos para mostrar al cliente: `@/components/CodigoQr` (QR simulado de recojo o pago) y `@/components/AvisoWhatsapp` (vista previa de un aviso). Los datos de ejemplo están en `src/data/demo.ts`.

## Guía visual (para todos los módulos)

El Inicio define el estilo. Para que tu módulo se vea igual, usa los componentes compartidos en lugar de estilos propios. Tu agente de IA puede aplicar esta guía en tu carpeta:

- **Cabecera de página:** `PageHeader` ya es una banda de color con el título en mayúsculas de dos colores (la última palabra va en naranja). Si quieres resaltar otra parte: `<PageHeader titulo="Tu" resaltado="pedido" />`.
- **Secciones:** `SectionHeader` con `centrado` y `resaltado` para las secciones principales (`titulo="Lo más" resaltado="pedido"`).
- **Tarjetas:** `Card` (bordes redondeados y sombra). Para tarjetas que se tocan: `transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`.
- **Fotos:** `rounded-xl` u `object-cover` en círculo (`rounded-full border-4 border-white`) como en Inicio; con zoom suave: `group` en la tarjeta y `group-hover:scale-105` en la imagen.
- **Botones:** `Button` (tipo píldora). Para el botón redondo de agregar: `Icono nombre="mas"`, nunca el carácter «+».
- **Íconos:** `@/components/Icono` (caja, reloj, etiqueta, check, carrito, ubicación, flecha, usuario, más) en lugar de emojis en botones y sellos.
- **Listas deslizables:** `@/components/Carrusel`.
- **Colores:** solo tokens: `bg-brand`, `bg-brand-soft`, `bg-accent`, `bg-accent-soft`, `bg-sun` (ofertas), `text-ok`, `text-warn`, `text-bad`. Nada de hex sueltos.
- **QR y WhatsApp:** `@/components/CodigoQr` y `@/components/AvisoWhatsapp`.

## Presentación (próxima semana)

Cada integrante prepara 1 a 2 diapositivas de su módulo con: dolor → solución → captura de pantalla → concepto del curso (journey, blueprint, 7P, NPS, KPI). El líder arma la introducción (proceso crítico) y el cierre (demo en vivo con el enlace de Vercel).

## Acceso simulado (login)

No hay backend: el login valida contra dos cuentas de prueba (visibles en `/login` para probar rápido) y guarda `sesion` en `useApp`.

| Cuenta | Correo | Contraseña |
|---|---|---|
| Cliente | `cliente@3a.pe` | `cliente123` |
| Administrador | `admin@3a.pe` | `admin123` |

| Rol | Rutas | Notas |
|---|---|---|
| Visitante | `/`, `/catalogo`, `/login` | Puede ver stock; para pedir debe ingresar |
| Cliente | `/catalogo`, `/pedido`, `/seguimiento`, `/club` | Si entra a `/panel` vuelve a su inicio |
| Administrador de tienda | `/panel` | Elige la tienda que administra en la cabecera |

Las rutas protegidas se declaran en `src/App.tsx` con `RequireRol`.
