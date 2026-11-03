# CX · Pide y recoge

Prototipo de experiencia de cliente (CX) para el taller de **Ingeniería de Sistemas de Servicio**.
Transforma un proceso crítico del caso Tiendas 3A, **la compra y el pago en hora punta** (colas, stock incierto, atención desigual), en una experiencia digital: el cliente ve el stock de su tienda, arma su pedido, paga con QR y lo recoge sin fila. Un panel de tienda con asistente IA anticipa colas y quiebres.

> Prototipo académico con datos simulados. No está afiliado a ninguna cadena comercial.

## Stack

| Pieza | Para qué |
|---|---|
| Vite + React + TypeScript | Frontend rápido, sin backend |
| Tailwind CSS v4 | Estilos con tokens compartidos (`src/index.css`) |
| React Router | Una ruta por módulo |
| Zustand + localStorage | Estado compartido entre módulos (`src/lib/store.ts`) |
| Vercel + GitHub | Cada push a `main` se publica solo; cada PR tiene su enlace de prueba |

## Empezar

Requisitos: Node 20 o superior y Git.

```bash
git clone https://github.com/BrayanRx/cx-tiendas-a3.git
cd cx-tiendas-a3
npm install
npm run dev
```

Abre http://localhost:5173.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local con recarga en vivo |
| `npm run build` | Revisa tipos y genera la versión de producción (debe pasar antes de cada PR) |
| `npm run lint` | Revisa errores comunes |
| `npm run preview` | Sirve la versión de producción localmente |

## Estructura

```
src/
  App.tsx              Rutas (solo lo edita el líder)
  components/          Layout y componentes compartidos (ui.tsx)
  config/equipo.ts     Reparto de módulos y tareas
  data/                Productos, tiendas y stock simulados
  lib/                 Tipos, estado global (store.ts) y formatos
  features/
    home/              Inicio y Ubícanos
    catalogo/          Catálogo con stock
    pedido/            Pedido y pago
    seguimiento/       Seguimiento y recojo
    club/              Club 3A y NPS
    panel/             Panel de tienda y asistente IA
    journey/           Journey antes y después (presentación)
    auth/              Login simulado
```

Cada integrante trabaja **solo dentro de su carpeta** de `src/features/`. El reparto y las tareas pendientes están en [EQUIPO.md](EQUIPO.md), el historial de lo asignado y lo hecho en [BITACORA.md](BITACORA.md) y el flujo de trabajo en [CONTRIBUTING.md](CONTRIBUTING.md).

## Bitácora y tareas

- **[EQUIPO.md](EQUIPO.md)** responde *qué falta*: cada integrante tiene su lista de tareas `[ ]` / `[x]`.
- **[BITACORA.md](BITACORA.md)** responde *qué pasó*: una tabla por integrante con lo asignado, hecho, cambios y bloqueos, con fecha y referencia al PR o commit.

Ambos se actualizan **en el mismo PR del cambio** y cada quien escribe **solo en su sección** (así no hay conflictos al hacer merge). Los agentes de IA lo hacen automáticamente porque está en sus instrucciones.

## Trabajar con agentes de IA

Todas las instrucciones para agentes viven en un solo archivo: **[AGENTS.md](AGENTS.md)**. Contiene el contexto de negocio (caso, proceso crítico, perfil del cliente, puntos de dolor), los criterios de diseño, las reglas técnicas y el seguimiento de tareas: el agente te identifica, te resume tus pendientes al empezar y actualiza la bitácora al terminar. Los demás archivos solo apuntan a él, para que todos los agentes sigan lo mismo:

| Archivo | Lo lee | Qué hace |
|---|---|---|
| `AGENTS.md` | Codex, Cursor y otros agentes | Instrucciones completas |
| `CLAUDE.md` | Claude Code | Importa `AGENTS.md` |
| `.agent/rules/proyecto.md` | Antigravity | Regla siempre activa que remite a `AGENTS.md` |
| `GEMINI.md` | Gemini CLI | Importa `AGENTS.md` |

Si cambian las reglas, edita **solo `AGENTS.md`** (por PR, avisando al líder).

**Cómo pedirle algo a tu agente.** Empieza indicando tu módulo, por ejemplo:

> Soy Ruth, responsable del catálogo. Dime qué tengo pendiente según EQUIPO.md y BITACORA.md, implementa la siguiente tarea en src/features/catalogo y actualiza la bitácora al terminar. No modifiques otras carpetas y ejecuta npm run build.

Si tu agente no parece seguir las reglas (por ejemplo, edita otras carpetas), pégale esa misma instrucción al inicio de la conversación. Revisa siempre el código que genera antes de hacer commit.
