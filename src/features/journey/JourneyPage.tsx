import { Link } from 'react-router-dom'
import { Badge, Card, PageHeader } from '@/components/ui'
import { getModulo } from '@/config/equipo'
import CurvaEmocion from './CurvaEmocion'
import { EMOCIONES, etapas, promedio } from './etapas'

// Responsable: Ruth Amaya · rama feat/journey
// Página pública (sin login) para la presentación: compara el journey actual con el de «Pide y recoge».
// Lee: modulos (@/config/equipo) para enlazar cada etapa con la pantalla que resuelve su dolor.
export default function JourneyPage() {
  const modulo = getModulo('journey')
  const antes = promedio(etapas.map((e) => e.emocionAntes))
  const despues = promedio(etapas.map((e) => e.emocionDespues))
  const momentos = etapas.filter((e) => e.momentoVerdad)

  return (
    <div className="space-y-10">
      <PageHeader titulo={modulo.nombre} descripcion={modulo.dolor}>
        <Badge tono="brand">Customer journey · 7 etapas</Badge>
      </PageHeader>

      <section aria-labelledby="h-curva" className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <h2 id="h-curva" className="text-lg font-semibold">
            Curva de emoción del cliente
          </h2>
          <p className="mt-1 mb-3 text-sm text-ink-muted">Cómo se siente en cada etapa de su compra, hoy y con la experiencia nueva.</p>
          <CurvaEmocion />
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <p className="text-sm text-ink-muted">Emoción promedio hoy</p>
            <p className="mt-1 text-3xl font-semibold text-bad">{antes.toFixed(1)} / 5</p>
          </Card>
          <Card className="bg-brand-soft">
            <p className="text-sm text-ink-muted">Con «Pide y recoge»</p>
            <p className="mt-1 text-3xl font-semibold text-ok">{despues.toFixed(1)} / 5</p>
            <p className="mt-1 text-xs text-ink-muted">+{(despues - antes).toFixed(1)} puntos de mejora</p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="h-etapas">
        <h2 id="h-etapas" className="mb-1 text-xl font-semibold">
          Las 7 etapas: antes y después
        </h2>
        <p className="mb-4 text-ink-muted">Cada dolor de hoy tiene una pantalla de la app que lo resuelve.</p>
        <ol className="space-y-4">
          {etapas.map((e) => (
            <li key={e.id}>
              <Card className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand-dark">{e.id}</span>
                  <h3 className="text-lg font-semibold">{e.nombre}</h3>
                  {e.momentoVerdad && <Badge tono="warn">★ Momento de la verdad</Badge>}
                </div>
                <p className="text-sm text-ink-muted">{e.accion}</p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg bg-red-50 p-4">
                    <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-bad">
                      Hoy
                      <span className="normal-case tracking-normal" title={EMOCIONES[e.emocionAntes].etiqueta}>
                        {EMOCIONES[e.emocionAntes].emoji} {EMOCIONES[e.emocionAntes].etiqueta}
                      </span>
                    </p>
                    <p className="mt-2 text-sm">{e.dolor}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ok">
                      Con «Pide y recoge»
                      <span className="normal-case tracking-normal" title={EMOCIONES[e.emocionDespues].etiqueta}>
                        {EMOCIONES[e.emocionDespues].emoji} {EMOCIONES[e.emocionDespues].etiqueta}
                      </span>
                    </p>
                    <p className="mt-2 text-sm">{e.solucion}</p>
                    <Link to={e.ruta} className="mt-2 inline-block text-sm font-medium text-brand hover:underline">
                      Ver pantalla: {e.pantalla} →
                    </Link>
                  </div>
                </div>

                <dl className="grid gap-3 border-t border-line pt-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Front-stage · lo que ve el cliente</dt>
                    <dd className="mt-1">{e.front}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Back-stage · lo que pasa detrás</dt>
                    <dd className="mt-1">{e.back}</dd>
                  </div>
                </dl>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="h-conceptos">
        <h2 id="h-conceptos" className="mb-3 text-xl font-semibold">
          Conceptos del curso
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <h3 className="font-medium">Customer journey</h3>
            <p className="mt-1 text-sm text-ink-muted">
              El recorrido completo del cliente, de que se entera de la tienda hasta que decide volver. Cada etapa tiene una acción, una emoción y
              un dolor.
            </p>
          </Card>
          <Card>
            <h3 className="font-medium">Momentos de la verdad</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Las interacciones donde el cliente decide si la tienda cumple: {momentos.map((m) => `${m.id}. ${m.nombre}`).join('; ')}. Ahí pusimos
              el mayor esfuerzo de mejora.
            </p>
          </Card>
          <Card>
            <h3 className="font-medium">Front-stage y back-stage</h3>
            <p className="mt-1 text-sm text-ink-muted">
              Front-stage es lo que el cliente ve y toca en la app y en el mostrador; back-stage es lo que la tienda hace por detrás, como la cola de
              pedidos y el asistente IA del panel.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
