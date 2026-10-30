import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Componentes de interfaz compartidos. Reutilízalos en tu módulo para que todo se vea igual.
// Si necesitas una variante nueva, agrégala aquí en vez de copiar estilos.

type Variante = 'primary' | 'secondary' | 'ghost'

const variantes: Record<Variante, string> = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow disabled:bg-line disabled:text-ink-muted disabled:shadow-none',
  secondary: 'bg-surface text-ink border border-line hover:border-ink-muted disabled:text-ink-muted',
  ghost: 'text-brand hover:bg-brand-soft disabled:text-ink-muted',
}

export function Button({
  variante = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed ${variantes[variante]} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 shadow-sm ${className}`}>{children}</div>
}

type Tono = 'neutral' | 'brand' | 'ok' | 'warn' | 'bad'

const tonos: Record<Tono, string> = {
  neutral: 'bg-canvas text-ink-muted',
  brand: 'bg-brand-soft text-brand-dark',
  ok: 'bg-green-50 text-ok',
  warn: 'bg-amber-50 text-warn',
  bad: 'bg-red-50 text-bad',
}

export function Badge({ children, tono = 'neutral' }: { children: ReactNode; tono?: Tono }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tonos[tono]}`}>{children}</span>
}

/** Cabecera de página: banda de color con el título en mayúsculas de dos colores (la última palabra va en naranja).
 *  `resaltado` reemplaza esa regla: titulo="Tu" resaltado="pedido". `children` va a la derecha (badges, enlaces, botones). */
export function PageHeader({
  titulo,
  resaltado,
  descripcion,
  children,
}: {
  titulo: string
  resaltado?: string
  descripcion?: string
  children?: ReactNode
}) {
  const palabras = titulo.split(' ')
  const [base, color] = resaltado !== undefined ? [titulo, resaltado] : palabras.length > 1 ? [palabras.slice(0, -1).join(' '), palabras.at(-1)] : [titulo, '']
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-brand-soft px-6 py-8 sm:px-10 sm:py-10">
      <span className="absolute -right-14 -top-14 size-48 rounded-full border-[22px] border-brand/10" aria-hidden />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            {base} {color && <span className="text-brand">{color}</span>}
          </h1>
          {descripcion && <p className="mt-3 max-w-2xl text-ink-muted">{descripcion}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

/** Encabezado de sección: título, subtítulo opcional y una acción (ej. «Ver todo →»).
 *  `centrado` lo muestra al medio con un separador decorativo, para las secciones principales. */
export function SectionHeader({
  id,
  titulo,
  resaltado,
  descripcion,
  centrado = false,
  children,
}: {
  id?: string
  titulo: string
  /** Parte del título en naranja de marca (ej. titulo="Canastas" resaltado="armadas"). */
  resaltado?: string
  descripcion?: string
  centrado?: boolean
  children?: ReactNode
}) {
  if (centrado) {
    return (
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex max-w-40 items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-brand/30" />
          <span className="size-2 rotate-45 rounded-[2px] bg-brand" />
          <span className="h-px flex-1 bg-brand/30" />
        </div>
        <h2 id={id} className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
          {titulo} {resaltado && <span className="text-brand">{resaltado}</span>}
        </h2>
        {descripcion && <p className="mx-auto mt-3 max-w-lg text-sm text-ink-muted sm:text-base">{descripcion}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    )
  }
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-xl font-bold tracking-tight sm:text-2xl">
          {titulo} {resaltado && <span className="text-brand">{resaltado}</span>}
        </h2>
        {descripcion && <p className="mt-1 text-sm text-ink-muted sm:text-base">{descripcion}</p>}
      </div>
      {children}
    </div>
  )
}
