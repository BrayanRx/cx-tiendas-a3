import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Componentes de interfaz compartidos. Reutilízalos en tu módulo para que todo se vea igual.
// Si necesitas una variante nueva, agrégala aquí en vez de copiar estilos.

type Variante = 'primary' | 'secondary' | 'ghost'

const variantes: Record<Variante, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-line disabled:text-ink-muted',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantes[variante]} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface p-5 ${className}`}>{children}</div>
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
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tonos[tono]}`}>{children}</span>
}

export function PageHeader({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-2xl text-ink-muted">{descripcion}</p>}
      </div>
      {children}
    </div>
  )
}
