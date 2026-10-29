import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Logo from '@/components/Logo'
import { inicioDeRol } from '@/components/RequireRol'
import { Button } from '@/components/ui'
import { useApp } from '@/lib/store'
import type { RolSesion } from '@/lib/types'

// Acceso simulado: no hay backend ni cuentas guardadas. Se valida el formato del correo y que la
// contraseña tenga 6+ caracteres; el rol elegido define qué módulos ve la persona.
const roles: { id: RolSesion; titulo: string; correo: string; demo: string }[] = [
  { id: 'cliente', titulo: 'Cliente', correo: 'tucorreo@ejemplo.pe', demo: 'Cliente' },
  { id: 'admin', titulo: 'Administrador de tienda', correo: 'tienda@ejemplo.pe', demo: 'Administrador' },
]

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_CLAVE = 6

export default function LoginPage() {
  const sesion = useApp((s) => s.sesion)
  const iniciarSesion = useApp((s) => s.iniciarSesion)
  const location = useLocation()
  const pedido = location.state as { desde?: string; rol?: RolSesion } | null

  const [rol, setRol] = useState<RolSesion>(pedido?.rol ?? 'cliente')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [intento, setIntento] = useState(false)
  const actual = roles.find((r) => r.id === rol)!

  // Vuelve a la ruta que se quiso abrir antes de ingresar, si corresponde a su rol.
  if (sesion) return <Navigate to={pedido?.desde && pedido.rol === sesion.rol ? pedido.desde : inicioDeRol(sesion.rol)} replace />

  const errorCorreo = !CORREO_VALIDO.test(correo.trim()) ? 'Ingresa un correo válido, por ejemplo nombre@dominio.pe.' : ''
  const errorClave = clave.length < MIN_CLAVE ? `La contraseña debe tener al menos ${MIN_CLAVE} caracteres.` : ''

  const entrar = (e: FormEvent) => {
    e.preventDefault()
    setIntento(true)
    if (errorCorreo || errorClave) return
    iniciarSesion({ rol, nombre: correo.trim().split('@')[0] || actual.demo })
  }

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[1fr_1.1fr]">
      <div className="bg-brand-gradient flex flex-col items-center justify-center gap-4 p-8 text-center text-white md:min-h-[32rem]">
        <Logo className="h-20 max-w-full" sobreNaranja />
        <p className="text-lg font-semibold tracking-tight">Barato en precio. Barato en tiempo.</p>
        <p className="text-sm text-white/90">#TiendasDeAhorro3A</p>
      </div>

      <form onSubmit={entrar} noValidate className="flex min-w-0 flex-col justify-center gap-5 p-6 sm:p-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
          <p className="mt-1 text-sm text-ink-muted">Ingresa a tu cuenta para continuar.</p>
        </div>

        <div role="radiogroup" aria-label="Tipo de cuenta" className="grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={rol === r.id}
              onClick={() => setRol(r.id)}
              className={`rounded-lg px-2 py-2 text-sm leading-tight transition-colors ${
                rol === r.id ? 'bg-surface font-medium text-brand-dark shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {r.titulo}
            </button>
          ))}
        </div>

        <label className="block text-sm">
          <span className="font-medium">Correo electrónico</span>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder={actual.correo}
            autoComplete="email"
            aria-invalid={intento && !!errorCorreo}
            aria-describedby={intento && errorCorreo ? 'err-correo' : undefined}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />
          {intento && errorCorreo && (
            <span id="err-correo" role="alert" className="mt-1 block text-xs text-bad">
              {errorCorreo}
            </span>
          )}
        </label>

        <label className="block text-sm">
          <span className="font-medium">Contraseña</span>
          <span className="relative mt-1 block">
            <input
              type={verClave ? 'text' : 'password'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={intento && !!errorClave}
              aria-describedby={intento && errorClave ? 'err-clave' : undefined}
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-3 pr-20 outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
            />
            <button
              type="button"
              onClick={() => setVerClave((v) => !v)}
              aria-pressed={verClave}
              className="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-2 text-xs font-medium text-brand hover:bg-brand-soft"
            >
              {verClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </span>
          {intento && errorClave && (
            <span id="err-clave" role="alert" className="mt-1 block text-xs text-bad">
              {errorClave}
            </span>
          )}
        </label>

        <Button type="submit" className="w-full py-3">
          Ingresar
        </Button>

        <p className="text-center text-xs text-ink-muted">Prototipo académico: el acceso es simulado y no se guarda ninguna contraseña.</p>
      </form>
    </div>
  )
}
