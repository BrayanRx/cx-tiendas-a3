# Cómo trabajamos

## Primera vez

1. Acepta la invitación al repositorio en GitHub (te la envía el líder).
2. Clona e instala:
   ```bash
   git clone https://github.com/BrayanRx/cx-tiendas-a3.git
   cd cx-tiendas-a3
   npm install
   ```
3. Crea tu rama (ver la tabla en [EQUIPO.md](EQUIPO.md)):
   ```bash
   git checkout -b feat/catalogo
   ```

## Cada vez que trabajes

```bash
git checkout main
git pull                      # trae lo último
git checkout feat/tu-modulo
git merge main                # mantén tu rama al día
npm run dev                   # trabaja y prueba en http://localhost:5173
npm run build                 # debe pasar sin errores
# marca tus tareas en EQUIPO.md y agrega tu fila en BITACORA.md
git add src/features/tu-modulo EQUIPO.md BITACORA.md
git commit -m "catalogo: filtros por categoría"
git push -u origin feat/tu-modulo
```

Luego abre un **Pull Request** hacia `main` en GitHub. Vercel comentará con un enlace de prueba: revísalo en el celular y en la computadora. El líder aprueba y hace el merge; en ~1 minuto se publica en producción.

## Reglas

- **Solo toca tu carpeta** `src/features/<tu-modulo>/`. Si necesitas cambiar algo compartido (`components/`, `lib/`, `data/`, `App.tsx`), avísale al líder o hazlo en un PR aparte y pequeño.
- **No subas directo a `main`.** Siempre por Pull Request.
- **`npm run build` debe pasar** antes de abrir el PR.
- **Nada de claves ni contraseñas en el código.** El frontend es público.
- Usa los componentes de `src/components/ui.tsx` y los colores de `src/index.css` (clases como `bg-brand`, `text-ink-muted`) para que todo se vea igual.
- Mensajes de commit cortos: `modulo: qué hiciste`.
- **Bitácora:** en cada PR, marca `[x]` tus tareas terminadas en [EQUIPO.md](EQUIPO.md) y agrega una fila al final de tu tabla en [BITACORA.md](BITACORA.md). Solo en tu sección, para no chocar con los demás.

## Usar Claude Code o Antigravity

Ambos leen las reglas del proyecto en [AGENTS.md](AGENTS.md): Claude Code a través de `CLAUDE.md` y Antigravity a través de `.agent/rules/proyecto.md` (detalle en el [README](README.md#trabajar-con-agentes-de-ia)). Pídeles trabajar solo en tu módulo, por ejemplo:

> Soy Ruth, responsable del catálogo. Dime qué tengo pendiente según EQUIPO.md y BITACORA.md, implementa la siguiente tarea en src/features/catalogo y actualiza la bitácora al terminar.

El agente está instruido para identificarte, resumirte tus pendientes, trabajar solo en tu módulo y actualizar `EQUIPO.md` y `BITACORA.md` en tu sección.

Revisa siempre lo que generan antes de hacer commit.
