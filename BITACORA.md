# Bitácora

Registro de lo que se **asigna** y lo que se **hace** en el proyecto. Las tareas pendientes de cada módulo están en [EQUIPO.md](EQUIPO.md); aquí queda el historial.

## Cómo registrar

- Cada integrante escribe **solo en su sección**, agregando filas **al final** de su tabla (así no chocan los merges).
- Una fila por entrega o asignación, en el mismo PR del cambio.
- Tipos: `asignado` (nueva tarea), `hecho` (llegó a main o va en este PR), `cambio` (se reasigna o se redefine), `bloqueo` (algo te frena y necesitas ayuda).
- Formato de fecha: `AAAA-MM-DD`. En «Referencia» pon el número de PR o el commit.

```
| 2026-10-30 | hecho | Filtro por categoría en el catálogo | PR #5 |
```

## Brayan · Base y líder

| Fecha | Tipo | Detalle | Referencia |
|---|---|---|---|
| 2026-10-29 | hecho | Base del proyecto: Vite + React + Tailwind, rutas, estado compartido, datos simulados, inicio y Ubícanos | f712024 |
| 2026-10-29 | hecho | Reglas para agentes (AGENTS.md, CLAUDE.md, Antigravity, Gemini) | 3926b9d |
| 2026-10-29 | hecho | Despliegue en Vercel conectado a `main` | — |
| 2026-10-29 | asignado | Proteger `main`, datos de demostración, componentes QR y aviso tipo WhatsApp | — |
| 2026-10-29 | cambio | Ruth suma «Journey antes y después»; Edison pasa a mejorar el asistente IA (sus módulos ya tenían versión inicial de Rafael) | commit «Bitácora del equipo» |
| 2026-10-29 | hecho | Ruta pública `/journey` y bitácora del equipo | commit «Bitácora del equipo» |
| 2026-10-30 | hecho | Datos de demostración (`cargarDemo`, botón «Modo demostración» en Inicio) y componentes compartidos `CodigoQr` y `AvisoWhatsapp` | este PR |
| 2026-10-30 | bloqueo | Proteger `main` se hace en GitHub (Settings → Branches) y requiere permisos de dueño del repositorio | — |
| 2026-10-30 | hecho | `main` protegida con ruleset: exige Pull Request y bloquea force push y borrado | — |
| 2026-10-30 | hecho | Revisión de PRs: merge de #11, #6 y #9; en #10 se quitaron 9 fotos con marcas registradas reales antes del merge | PR #10 |
| 2026-10-30 | hecho | Rediseño de la base inspirado en tiendas de abarrotes en línea, con la paleta 3A: canastas semanal, quincenal y bodeguero; opiniones NPS; «Antes y después» en el pie de página | este PR |
| 2026-10-30 | cambio | Inicio con más jerarquía: carruseles (canastas, lo más pedido, opiniones), tienda elegida destacada y componente compartido `Carrusel` | este PR |
| 2026-10-30 | cambio | Acabado más profesional en Inicio: íconos de línea (`Icono`), tarjetas que se elevan, encabezados centrados con separador, fondo de puntos y aviso emergente al agregar al carrito | este PR |

## Ruth · Catálogo + Journey

| Fecha | Tipo | Detalle | Referencia |
|---|---|---|---|
| 2026-10-29 | asignado | Catálogo con stock | f712024 |
| 2026-10-29 | cambio | Rafael entregó la versión inicial del catálogo; Ruth sigue como dueña y lo pule | bc1b880 |
| 2026-10-29 | asignado | Pulir catálogo y crear la página «Journey antes y después» (ver EQUIPO.md) | commit «Bitácora del equipo» |

## Nicole · Pedido y pago

| Fecha | Tipo | Detalle | Referencia |
|---|---|---|---|
| 2026-10-29 | asignado | Pedido y pago | f712024 |

## Hemsy · Seguimiento y recojo

| Fecha | Tipo | Detalle | Referencia |
|---|---|---|---|
| 2026-10-29 | asignado | Seguimiento y recojo | f712024 |
| 2026-10-29 | hecho | Seguimiento: línea de tiempo, QR de recojo, aviso tipo WhatsApp, Mis pedidos, reclamo o cambio, cancelar e invitación a la encuesta NPS | 15309, PR #7 |
| 2026-10-29 | hecho | Seguimiento: «Antes / ahora» con el dolor que resuelve y actualización en vivo cuando el Panel avanza el pedido en otra pestaña | este PR |

## Rafael · Club 3A y NPS

| Fecha | Tipo | Detalle | Referencia |
|---|---|---|---|
| 2026-10-29 | asignado | Club 3A y NPS | f712024 |
| 2026-10-29 | hecho | Club 3A: saldo y nivel, cupones, historial, encuesta NPS, cómo ganar puntos | 7810bfe, PR #1 |
| 2026-10-29 | hecho | Versión inicial del catálogo (módulo de Ruth) | bc1b880, PR #2 |
| 2026-10-29 | hecho | Versión inicial del panel de tienda (módulo de Edison) | 08c1ba6, PR #3 |
| 2026-10-29 | hecho | Identidad visual, logo y login simulado con roles (subido directo a main) | 81782e9, bb80ae9, 0932ad8 |
| 2026-10-29 | hecho | Página «Journey antes y después» (módulo de Ruth): 7 etapas con acción, emoción y dolor, pantalla que lo resuelve, curva de emoción y conceptos del curso | este PR |
| 2026-10-29 | hecho | Fotos reales de los 18 productos del catálogo (Wikimedia Commons, con créditos y respaldo de emoji) | PR #4 |
| 2026-10-29 | hecho | Catálogo (módulo de Ruth): pulido en celular, textos cercanos, «avísame cuando llegue» y sugerencia del producto en otra tienda cercana | este PR |

## Edison · Panel de tienda y asistente IA

| Fecha | Tipo | Detalle | Referencia |
|---|---|---|---|
| 2026-10-29 | asignado | Panel de tienda y asistente IA | f712024 |
| 2026-10-29 | cambio | Rafael entregó la versión inicial del panel; Edison sigue como dueño | 08c1ba6 |
| 2026-10-29 | asignado | Asistente IA en formato chat basado en los datos del panel (ver EQUIPO.md) | commit «Bitácora del equipo» |
