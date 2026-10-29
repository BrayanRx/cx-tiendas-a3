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
git add src/features/tu-modulo
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

## Usar Claude Code o Antigravity

Ambos leen las reglas del proyecto en [AGENTS.md](AGENTS.md) (Claude Code a través de `CLAUDE.md`). Pídeles trabajar solo en tu módulo, por ejemplo:

> Implementa el módulo de catálogo en src/features/catalogo siguiendo AGENTS.md y las tareas de EQUIPO.md. Usa el store y los componentes compartidos; no modifiques archivos fuera de mi carpeta.

Revisa siempre lo que generan antes de hacer commit.
