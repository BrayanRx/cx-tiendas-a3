import { useEffect, useRef, useState, type ReactNode } from 'react'

// Carrusel horizontal minimalista: en celular se desliza con el dedo; en escritorio tiene flechas
// (solo si hay más contenido del que entra en pantalla).
// Cada hijo debe tener su propio ancho, ej. <div className="w-[80%] sm:w-72 shrink-0">…</div>.
// Ej.: <Carrusel etiqueta="Canastas">{canastas.map(…)}</Carrusel>
export default function Carrusel({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  const pista = useRef<HTMLDivElement>(null)
  const [desborda, setDesborda] = useState(false)
  const mover = (dir: 1 | -1) => pista.current?.scrollBy({ left: dir * pista.current.clientWidth * 0.8, behavior: 'smooth' })

  useEffect(() => {
    const el = pista.current
    if (!el) return
    const medir = () => setDesborda(el.scrollWidth > el.clientWidth + 1)
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  return (
    <div className="relative">
      <div
        ref={pista}
        role="region"
        aria-label={etiqueta}
        tabIndex={0}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [&>*]:snap-start"
      >
        {children}
      </div>
      {desborda &&
        (['anterior', 'siguiente'] as const).map((lado) => (
          <button
            key={lado}
            type="button"
            aria-label={lado === 'anterior' ? 'Ver anteriores' : 'Ver siguientes'}
            onClick={() => mover(lado === 'anterior' ? -1 : 1)}
            className={`absolute top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-lg shadow-md hover:border-ink-muted md:grid ${lado === 'anterior' ? '-left-3' : '-right-3'}`}
          >
            {lado === 'anterior' ? '‹' : '›'}
          </button>
        ))}
    </div>
  )
}
