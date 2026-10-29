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
```

Cada integrante trabaja **solo dentro de su carpeta** de `src/features/`. El reparto y las tareas están en [EQUIPO.md](EQUIPO.md) y el flujo de trabajo en [CONTRIBUTING.md](CONTRIBUTING.md).
