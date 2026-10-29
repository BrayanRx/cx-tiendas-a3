import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-semibold">404</p>
      <p className="mt-2 text-ink-muted">Esta página no existe.</p>
      <Link to="/" className="mt-6 inline-block text-brand hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
