import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import Logo from '@/components/Logo'
import { inicioDeRol } from '@/components/RequireRol'
import { Button } from '@/components/ui'
import { useApp } from '@/lib/store'
import type { RolSesion } from '@/lib/types'

// Acceso simulado: no hay backend. Las cuentas de prueba están a la vista a propósito para probar rápido;
// el rol sale de la cuenta con la que se ingresa. No uses estos datos fuera del prototipo.
const cuentas: { rol: RolSesion; titulo: string; detalle: string; correo: string; clave: string; nombre: string }[] = [
  { rol: 'cliente', titulo: 'Cliente', detalle: 'Compra y recoge', correo: 'cliente@3a.pe', clave: 'cliente123', nombre: 'Cliente demo' },
  { rol: 'admin', titulo: 'Administrador', detalle: 'Panel de tienda', correo: 'admin@3a.pe', clave: 'admin123', nombre: 'Admin demo' },
]

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const sesion = useApp((s) => s.sesion)
  const iniciarSesion = useApp((s) => s.iniciarSesion)
  const location = useLocation()
  const pedido = location.state as { desde?: string; rol?: RolSesion } | null

  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [intento, setIntento] = useState(false)
  const [rechazado, setRechazado] = useState(false)

  // Vuelve a la ruta que se quiso abrir antes de ingresar, si corresponde a su rol.
  if (sesion) return <Navigate to={pedido?.desde && pedido.rol === sesion.rol ? pedido.desde : inicioDeRol(sesion.rol)} replace />

  const errorCorreo = !CORREO_VALIDO.test(correo.trim()) ? 'Ingresa un correo válido, por ejemplo nombre@dominio.pe.' : ''
  const errorClave = !clave ? 'Ingresa tu contraseña.' : ''

  const usar = (c: (typeof cuentas)[number]) => {
    setCorreo(c.correo)
    setClave(c.clave)
    setIntento(false)
    setRechazado(false)
  }

  const entrar = (e: FormEvent) => {
    e.preventDefault()
    setIntento(true)
    setRechazado(false)
    if (errorCorreo || errorClave) return
    const cuenta = cuentas.find((c) => c.correo === correo.trim().toLowerCase() && c.clave === clave)
    if (!cuenta) return setRechazado(true)
    iniciarSesion({ rol: cuenta.rol, nombre: cuenta.nombre })
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

        <label className="block text-sm">
          <span className="font-medium">Correo electrónico</span>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="cliente@3a.pe"
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

        {rechazado && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-bad">
            Correo o contraseña incorrectos. Prueba con una de las cuentas de abajo.
          </p>
        )}

        <Button type="submit" className="w-full py-3">
          Ingresar
        </Button>

        <div className="rounded-xl border border-dashed border-line bg-canvas p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Cuentas de prueba</p>
          <ul className="mt-2 space-y-2">
            {cuentas.map((c) => (
              <li key={c.rol} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="min-w-0">
                  <span className="block font-medium">
                    {c.titulo} <span className="font-normal text-ink-muted">· {c.detalle}</span>
                  </span>
                  <code className="block break-all text-xs text-ink-muted">
                    {c.correo} / {c.clave}
                  </code>
                </span>
                <button
                  type="button"
                  onClick={() => usar(c)}
                  className="shrink-0 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-brand hover:border-brand"
                >
                  Usar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  )
}
