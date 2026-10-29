import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '@/components/Logo'
import { inicioDeRol } from '@/components/RequireRol'
import { Button, Card } from '@/components/ui'
import { useApp } from '@/lib/store'
import type { RolSesion } from '@/lib/types'

// Acceso simulado: no hay backend ni contraseñas. Solo elige el rol para mostrar los módulos que le corresponden.
const roles: { id: RolSesion; titulo: string; detalle: string; modulos: string[]; demo: string }[] = [
  {
    id: 'cliente',
    titulo: 'Cliente',
    detalle: 'Compra y recoge sin fila.',
    modulos: ['Catálogo con stock', 'Mi pedido y pago', 'Seguimiento y recojo', 'Club 3A y NPS'],
    demo: 'Cliente demo',
  },
  {
    id: 'admin',
    titulo: 'Administrador de tienda',
    detalle: 'Gestiona la operación de la tienda.',
    modulos: ['Panel de tienda', 'Asistente IA', 'Alertas de stock y KPIs'],
    demo: 'Admin demo',
  },
]

export default function LoginPage() {
  const sesion = useApp((s) => s.sesion)
  const iniciarSesion = useApp((s) => s.iniciarSesion)
  const navigate = useNavigate()
  const location = useLocation()
  const pedido = location.state as { desde?: string; rol?: RolSesion } | null

  const [rol, setRol] = useState<RolSesion>(pedido?.rol ?? 'cliente')
  const [correo, setCorreo] = useState('')
  const actual = roles.find((r) => r.id === rol)!

  if (sesion) return <Navigate to={inicioDeRol(sesion.rol)} replace />

  const entrar = (e: FormEvent) => {
    e.preventDefault()
    const nombre = correo.trim().split('@')[0] || actual.demo
    iniciarSesion({ rol, nombre })
    navigate(pedido?.desde && pedido.rol === rol ? pedido.desde : inicioDeRol(rol), { replace: true })
  }

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[1fr_1.1fr]">
      <div className="bg-brand-gradient flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
        <Logo className="h-20" sobreNaranja />
        <p className="text-lg font-semibold tracking-tight">Barato en precio. Barato en tiempo.</p>
        <p className="text-sm text-white/90">#TiendasDeAhorro3A</p>
      </div>

      <form onSubmit={entrar} className="space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
          <p className="mt-1 text-sm text-ink-muted">Acceso simulado para el prototipo: no se valida ninguna contraseña.</p>
        </div>

        <div role="radiogroup" aria-label="Tipo de cuenta" className="grid gap-2 sm:grid-cols-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={rol === r.id}
              onClick={() => setRol(r.id)}
              className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                rol === r.id ? 'border-brand bg-brand-soft' : 'border-line hover:border-ink-muted'
              }`}
            >
              <span className="block font-medium">{r.titulo}</span>
              <span className="text-xs text-ink-muted">{r.detalle}</span>
            </button>
          ))}
        </div>

        <Card className="bg-canvas">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Módulos disponibles</p>
          <ul className="mt-2 space-y-1 text-sm">
            {actual.modulos.map((m) => (
              <li key={m} className="flex gap-2">
                <span className="text-brand">✓</span>
                {m}
              </li>
            ))}
          </ul>
        </Card>

        <label className="block text-sm">
          <span className="font-medium">Correo (opcional)</span>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder={rol === 'admin' ? 'tienda@ejemplo.pe' : 'tucorreo@ejemplo.pe'}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5"
          />
        </label>

        <Button type="submit" className="w-full">
          Ingresar como {actual.titulo.toLowerCase()}
        </Button>
      </form>
    </div>
  )
}
