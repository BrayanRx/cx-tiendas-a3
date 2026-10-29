import { getModulo, type ModuloId } from '@/config/equipo'
import { Badge, Card, PageHeader } from './ui'

// Pantalla provisional de cada módulo. El responsable la reemplaza por su implementación.
export default function ModulePlaceholder({ id }: { id: ModuloId }) {
  const m = getModulo(id)
  return (
    <>
      <PageHeader titulo={m.nombre} descripcion={m.dolor}>
        <Badge tono="warn">En construcción</Badge>
      </PageHeader>
      <Card>
        <p className="text-sm text-ink-muted">
          Responsable: <span className="font-medium text-ink">{m.responsable}</span> · rama{' '}
          <code className="rounded bg-canvas px-1.5 py-0.5">{m.rama}</code>
        </p>
        <h2 className="mt-5 mb-2 text-sm font-semibold">Por hacer</h2>
        <ul className="space-y-1.5 text-sm">
          {m.tareas.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-ink-muted">○</span>
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
