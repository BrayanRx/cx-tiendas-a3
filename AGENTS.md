# Instrucciones para agentes de IA (Claude Code, Antigravity, otros)

Proyecto: prototipo frontend de experiencia de cliente «Pide y recoge» para un curso universitario. Sin backend: todos los datos son simulados.

## Stack
- Vite + React 19 + TypeScript, Tailwind CSS v4, React Router 7, Zustand (persistido en localStorage).
- Alias de importación: `@/` apunta a `src/`.
- Idioma de la interfaz y de los comentarios: español.

## Reglas de trabajo
- Cada integrante es dueño de una carpeta en `src/features/<modulo>/`. Modifica **solo** la carpeta del módulo que te pidieron, salvo instrucción explícita.
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
- `EQUIPO.md`: reparto y contrato compartido entre módulos.
