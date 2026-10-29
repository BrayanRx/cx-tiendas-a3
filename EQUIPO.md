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

> Los responsables son una propuesta: pueden intercambiarse. Si cambian, actualicen esta tabla y `src/config/equipo.ts`.

## Tareas por módulo

### Brayan · Base, inicio y Ubícanos (líder)
- [x] Proyecto, rutas, layout, tokens de diseño, componentes compartidos y datos simulados
- [x] Página de inicio y selector de tienda
- [ ] Conectar Vercel al repositorio y proteger `main`
- [ ] Revisar y aprobar los PR de cada módulo
- [ ] Integración final y ensayo del recorrido completo

### Ruth · Catálogo con stock
- [ ] Grilla de productos con precio y stock de la tienda elegida
- [ ] Filtros por categoría y «solo marca propia»
- [ ] Búsqueda por nombre
- [ ] Agregar al carrito (deshabilitado si stock = 0, con aviso «agotado en esta tienda»)
- [ ] Aviso de precio por volumen para bodegueros
- [ ] Resumen del carrito con botón «Continuar al pedido»

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
- [ ] Saldo de puntos y nivel del cliente
- [ ] Cupones canjeables en marca propia
- [ ] Historial de puntos por pedido
- [ ] Encuesta NPS de 0 a 10 con comentario
- [ ] Cómo ganar puntos

### Edison · Panel de tienda y asistente IA
- [ ] Cola de pedidos por estado con botón «avanzar»
- [ ] Alertas de quiebre de stock de la tienda
- [ ] KPIs: tiempo en cola, pedidos del día, NPS, recompra
- [ ] Asistente IA simulado que sugiere acciones (abrir caja, reponer, priorizar)
- [ ] Comparativo antes / después para la presentación

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
