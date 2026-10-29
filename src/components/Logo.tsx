// Logotipo 3A Hard Discount dibujado en SVG (recreación simple para el prototipo).
// `sobreNaranja`: usa el carrito blanco para fondos naranjas; en fondos claros el carrito va en naranja de marca.
export default function Logo({ className = 'h-9', sobreNaranja = false }: { className?: string; sobreNaranja?: boolean }) {
  const carrito = sobreNaranja ? '#ffffff' : 'var(--color-brand)'
  return (
    <svg viewBox="0 0 150 52" role="img" aria-label="3A Hard Discount" className={className}>
      <text
        x="2"
        y="42"
        fontFamily="system-ui, 'Segoe UI', Arial, sans-serif"
        fontSize="48"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="-3"
        fill="var(--color-accent)"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        3A
      </text>
      <g fill="none" stroke={carrito} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M80 6h8l9 27h34l7-22H92" />
        <path d="M95 18h39M100 26h30M107 11l4 22M118 11v22M129 11l-3 22" strokeWidth="1.8" />
      </g>
      <circle cx="104" cy="44" r="4" fill={carrito} />
      <circle cx="127" cy="44" r="4" fill={carrito} />
    </svg>
  )
}
