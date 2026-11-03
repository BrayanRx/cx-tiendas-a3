// Código QR simulado: una grilla estable generada a partir de un texto (no se puede escanear).
// Úsalo para el código de recojo (Seguimiento) o para el pago con QR (Pedido).
// Ej.: <CodigoQr codigo={pedido.id} /> · <CodigoQr codigo="PAGO-123" activo={false} className="size-32" />
const N = 21

const esMarcaEsquina = (x: number, y: number) => {
  const en = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
  return en(0, 0) || en(N - 7, 0) || en(0, N - 7)
}

const celdaMarca = (x: number, y: number) => {
  const lx = x >= N - 7 ? x - (N - 7) : x
  const ly = y >= N - 7 ? y - (N - 7) : y
  const borde = lx === 0 || lx === 6 || ly === 0 || ly === 6
  const centro = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
  return borde || centro
}

export default function CodigoQr({
  codigo,
  activo = true,
  className = 'size-44',
  etiqueta,
}: {
  codigo: string
  /** false lo muestra en gris (ej. pedido aún no listo). */
  activo?: boolean
  /** Tamaño con clases de Tailwind, ej. "size-32". */
  className?: string
  /** Texto para lectores de pantalla. */
  etiqueta?: string
}) {
  let semilla = [...codigo].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2147483647, 17)
  const azar = () => {
    semilla = (semilla * 48271) % 2147483647
    return semilla / 2147483647
  }

  const celdas: { x: number; y: number }[] = []
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const lleno = esMarcaEsquina(x, y) ? celdaMarca(x, y) : azar() > 0.5
      if (lleno) celdas.push({ x, y })
    }
  }

  return (
    <svg
      viewBox={`-1 -1 ${N + 2} ${N + 2}`}
      className={`rounded-lg bg-surface ${activo ? 'text-ink' : 'text-line'} ${className}`}
      role="img"
      aria-label={etiqueta ?? `Código QR ${codigo}`}
    >
      {celdas.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1.02} height={1.02} fill="currentColor" />
      ))}
    </svg>
  )
}
