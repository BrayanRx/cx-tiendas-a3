import { EMOCIONES, etapas } from './etapas'

const ANCHO = 700
const ALTO = 280
const MARGEN = { izq: 44, der: 20, sup: 20, inf: 40 }

const x = (i: number) => MARGEN.izq + (i * (ANCHO - MARGEN.izq - MARGEN.der)) / (etapas.length - 1)
const y = (emocion: number) => MARGEN.sup + ((5 - emocion) * (ALTO - MARGEN.sup - MARGEN.inf)) / 4
const puntos = (valores: number[]) => valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')

// Curva de emoción del cliente a lo largo del journey: hoy (rojo) vs. con «Pide y recoge» (verde).
export default function CurvaEmocion() {
  const antes = etapas.map((e) => e.emocionAntes)
  const despues = etapas.map((e) => e.emocionDespues)
  const descripcion = etapas
    .map((e) => `${e.id}. ${e.nombre}: antes ${e.emocionAntes} de 5, después ${e.emocionDespues} de 5`)
    .join('. ')

  return (
    <div>
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={`Curva de emoción del cliente. ${descripcion}`} className="w-full">
        {[1, 2, 3, 4, 5].map((n) => (
          <g key={n}>
            <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y(n)} y2={y(n)} stroke="var(--color-line)" strokeWidth="1" />
            {(n === 1 || n === 3 || n === 5) && (
              <text x={MARGEN.izq - 10} y={y(n) + 6} textAnchor="end" fontSize="18">
                {EMOCIONES[n].emoji}
              </text>
            )}
          </g>
        ))}

        <polyline points={puntos(antes)} fill="none" stroke="var(--color-bad)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={puntos(despues)} fill="none" stroke="var(--color-ok)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {etapas.map((e, i) => (
          <g key={e.id}>
            <circle cx={x(i)} cy={y(e.emocionAntes)} r="5" fill="var(--color-bad)" stroke="var(--color-surface)" strokeWidth="2" />
            <circle cx={x(i)} cy={y(e.emocionDespues)} r="5" fill="var(--color-ok)" stroke="var(--color-surface)" strokeWidth="2" />
            <text x={x(i)} y={ALTO - 14} textAnchor="middle" fontSize="14" fontWeight={e.momentoVerdad ? 700 : 400} fill="var(--color-ink)">
              {e.id}
              {e.momentoVerdad ? '★' : ''}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-5 rounded bg-bad" /> Hoy, sin la app
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-5 rounded bg-ok" /> Con «Pide y recoge»
        </span>
        <span>★ Momento de la verdad</span>
      </div>
    </div>
  )
}
