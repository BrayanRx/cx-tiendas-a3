# Instrucciones para agentes de IA (Claude Code, Antigravity, otros)

Proyecto: prototipo frontend de experiencia de cliente «Pide y recoge» para un curso universitario. Sin backend: todos los datos son simulados.

## Contexto de negocio
- **Curso y entrega:** taller de Ingeniería de Sistemas de Servicio. Se pide una primera versión de CX que transforme un proceso crítico del negocio usando IA. Se presenta en vivo ante el docente.
- **Caso:** Tiendas 3A, tiendas de descuento (hard discount) de barrio en Lima: canasta básica, marcas propias, precio bajo y operación de bajo costo.
- **Proceso crítico:** compra y pago en tienda en hora punta.
- **Cliente principal:** ama o jefe de hogar de 28 a 45 años, NSE C/D/E, compra semanal o quincenal, sensible al precio, usa el celular y WhatsApp. Otros segmentos: bodegueros (compran por volumen) y consumidores de paso.
- **Puntos de dolor** (customer journey): poca presencia digital, no saber si hay stock, señalización y precios confusos, colas en caja, atención desigual entre tiendas, sin canal de reclamos, fidelización solo por precio.
- **Propuesta:** «Barato en precio, barato en tiempo»: ver stock → pedir → pagar con QR → recoger sin fila, más un panel de tienda con asistente IA en el back-stage.

## Criterios de diseño y contenido
- Cada pantalla debe dejar claro **qué dolor resuelve** (el campo `dolor` de su módulo en `src/config/equipo.ts`). Eso es lo que se evalúa.
- Textos en español peruano, cercanos y simples: tutea al cliente, frases cortas, sin tecnicismos. Precios en soles con `formatSoles`.
- Pensado primero para celular (el cliente compra desde su teléfono); el panel de tienda puede priorizar escritorio.
- Cuando aplique, conecta la pantalla con un concepto del curso: customer journey, blueprint (front-stage / back-stage), 7P, NPS, KPI, utilidad y garantía.
- Los datos son simulados y deben verse realistas (precios, tiempos y stock plausibles), sin usar logotipos ni marcas registradas reales de la cadena.

## Stack
- Vite + React 19 + TypeScript, Tailwind CSS v4, React Router 7, Zustand (persistido en localStorage).
- Alias de importación: `@/` apunta a `src/`.
- Idioma de la interfaz y de los comentarios: español.

## Antes de empezar: identifica al integrante y sus tareas
1. Averigua quién te está pidiendo el cambio y cuál es su módulo. Si no lo dijo, pregúntaselo antes de tocar código. La tabla de responsables está en `EQUIPO.md`.
2. Lee su sección en `EQUIPO.md` (tareas `[ ]` pendientes) y en `BITACORA.md` (lo asignado, lo hecho y los bloqueos).
3. Al inicio de la conversación, resúmele en 2 o 3 líneas qué tiene pendiente y propón por cuál empezar. Si lo que pide no está en sus tareas, avísale y pregunta si igual quiere hacerlo.
4. No implementes tareas asignadas a otro integrante, aunque parezcan fáciles. Si algo de otro módulo te bloquea, regístralo como `bloqueo` en la bitácora.

## Al terminar: actualiza la bitácora y las tareas
En el mismo commit o PR del cambio:
- En `EQUIPO.md`, marca con `[x]` las tareas completadas, **solo en la sección del integrante**. Si surgió una tarea nueva, agrégala como `[ ]`.
- En `BITACORA.md`, agrega una fila **al final de la tabla del integrante** (nunca en la de otro), con fecha `AAAA-MM-DD`, tipo (`hecho`, `asignado`, `cambio` o `bloqueo`), detalle corto y referencia (número de PR o commit; si aún no existe, escribe «este PR»).
- No reordenes ni edites filas anteriores de la bitácora: es un historial.
- Al final de tu respuesta, recuérdale al integrante qué tareas le quedan pendientes.

## Reglas de trabajo
- Cada integrante es dueño de una carpeta en `src/features/<modulo>/`. Modifica **solo** la carpeta del módulo que te pidieron, salvo instrucción explícita. Excepción: `EQUIPO.md` y `BITACORA.md`, en la sección de ese integrante.
- Nunca hagas push directo a `main`: trabaja en la rama del módulo y abre un Pull Request.
- Archivos compartidos (no modificar sin que lo pidan): `src/App.tsx`, `src/components/`, `src/lib/`, `src/data/`, `src/config/`, `src/index.css`.
- El estado entre módulos va por `useApp` en `src/lib/store.ts`. No crees otro estado global ni otra clave de localStorage para datos compartidos. El estado local de una pantalla sí puede usar `useState`.
- Tipos compartidos en `src/lib/types.ts`. Datos en `src/data/`.
- Estilos: clases de Tailwind con los tokens de `src/index.css` (`bg-brand`, `bg-brand-soft`, `text-ink`, `text-ink-muted`, `border-line`, `bg-surface`, `bg-canvas`, `text-ok`, `text-warn`, `text-bad`). No uses colores hex sueltos.
- Reutiliza `Button`, `Card`, `Badge` y `PageHeader` de `src/components/ui.tsx`.
- Diseño responsive: debe verse bien en celular (360 px) y en escritorio.
- Nunca incluyas claves de API, tokens ni contraseñas. El «asistente IA» se simula en el frontend (reglas o respuestas preparadas).
- Muestra solo datos simulados; el pie de página ya indica que es un prototipo académico.
- Antes de terminar, ejecuta `npm run build` y corrige cualquier error de tipos.

## Mapa del proyecto
- `src/config/equipo.ts`: módulos, responsables y tareas pendientes de cada uno.
- `src/data/productos.ts`, `src/data/tiendas.ts`: catálogo, tiendas y stock por tienda.
- `src/lib/store.ts`: carrito, pedidos, puntos, encuestas NPS y sus acciones.
- `EQUIPO.md`: reparto, tareas pendientes por integrante y contrato compartido entre módulos.
- `BITACORA.md`: historial de lo asignado y lo hecho por cada integrante.
