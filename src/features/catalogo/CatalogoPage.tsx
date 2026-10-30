import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { categorias, getProducto, productos } from '@/data/productos'
import { getTienda, stock } from '@/data/tiendas'
import { precioUnitario, totalItems, useApp } from '@/lib/store'
import type { Categoria } from '@/lib/types'
import { formatSoles } from '@/lib/format'
import { alternativaCercana } from './cercanas'
import ProductoFoto from './ProductoFoto'

// Responsable: Ruth Amaya · rama feat/catalogo
// Lee: productos, categorias (@/data/productos), stock y tiendaId (@/data/tiendas, useApp)
// Escribe: agregarAlCarrito, cambiarCantidad (useApp)
const STOCK_BAJO = 8

export default function CatalogoPage() {
  const { tiendaId, setTienda, carrito, agregarAlCarrito, cambiarCantidad } = useApp()
  const tienda = getTienda(tiendaId)
  const stockTienda = stock[tiendaId] ?? {}

  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas')
  const [soloPropia, setSoloPropia] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  // «Avísame cuando llegue»: simulado, vive solo en esta pantalla.
  const [avisos, setAvisos] = useState<string[]>([])
  const alternarAviso = (id: string) => setAvisos((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter(
      (p) =>
        (categoria === 'todas' || p.categoria === categoria) &&
        (!soloPropia || p.marcaPropia) &&
        (!q || `${p.nombre} ${p.marca}`.toLowerCase().includes(q)),
    )
  }, [categoria, soloPropia, busqueda])

  const cantidadEn = (id: string) => carrito.find((i) => i.productoId === id)?.cantidad ?? 0
  const unidades = carrito.reduce((n, i) => n + i.cantidad, 0)

  return (
    <div className={unidades > 0 ? 'pb-24 lg:pb-0' : ''}>
      <PageHeader
        titulo="Catálogo"
        descripcion={`Mira qué hay en ${tienda?.nombre ?? 'tu tienda'} antes de salir de casa. Elige tus productos y recógelos sin hacer cola.`}
      >
        <Link to="/" className="text-sm text-brand hover:underline">
          Cambiar tienda
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Productos" className="min-w-0">
          <div className="mb-4 space-y-3">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="¿Qué buscas? Arroz, leche, detergente…"
              aria-label="Buscar producto"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm"
            />
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              <Chip activo={categoria === 'todas'} onClick={() => setCategoria('todas')}>
                Todas
              </Chip>
              {categorias.map((c) => (
                <Chip key={c.id} activo={categoria === c.id} onClick={() => setCategoria(c.id)}>
                  {c.nombre}
                </Chip>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={soloPropia} onChange={(e) => setSoloPropia(e.target.checked)} className="size-4 accent-brand" />
              Solo marca propia
            </label>
          </div>

          {visibles.length === 0 ? (
            <Card>
              <p className="text-sm text-ink-muted">No encontramos eso en esta tienda. Prueba con otra palabra o quita los filtros.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
              {visibles.map((p) => {
                const disponible = stockTienda[p.id] ?? 0
                const enCarrito = cantidadEn(p.id)
                const agotado = disponible === 0
                const tope = enCarrito >= disponible
                const alternativa = agotado ? alternativaCercana(p.id, tiendaId) : null
                const avisar = avisos.includes(p.id)
                return (
                  <Card key={p.id} className="flex flex-col gap-1">
                    <div className="relative mb-2 overflow-hidden rounded-lg">
                      <ProductoFoto producto={p} className={`aspect-[4/3] w-full ${agotado ? 'opacity-50 grayscale' : ''}`} emojiClase="text-6xl" />
                      {p.marcaPropia && (
                        <span className="absolute left-2 top-2">
                          <Badge tono="brand">Marca propia</Badge>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-medium leading-tight">{p.nombre}</p>
                    <p className="text-sm text-ink-muted">
                      {p.marca} · {p.presentacion}
                    </p>
                    <p className="text-lg font-semibold">{formatSoles(p.precio)}</p>
                    {p.precioVolumen && p.volumenMin && (
                      <p className="text-xs text-ok">
                        Si eres bodeguero: {formatSoles(p.precioVolumen)} c/u desde {p.volumenMin} unid.
                      </p>
                    )}
                    <div className="mb-2 mt-1">
                      {agotado ? (
                        <Badge tono="bad">Agotado en esta tienda</Badge>
                      ) : disponible <= STOCK_BAJO ? (
                        <Badge tono="warn">¡Quedan solo {disponible}!</Badge>
                      ) : (
                        <Badge tono="ok">{disponible} disponibles</Badge>
                      )}
                    </div>
                    {agotado ? (
                      <div className="mt-auto space-y-2">
                        {alternativa && (
                          <div className="rounded-lg bg-brand-soft p-3 text-sm">
                            <p>
                              Aquí se agotó, pero en <span className="font-medium">{alternativa.tienda.nombre}</span> ({alternativa.tienda.distrito}) quedan{' '}
                              {alternativa.unidades}.
                            </p>
                            <button type="button" onClick={() => setTienda(alternativa.tienda.id)} className="mt-1 font-medium text-brand hover:underline">
                              Ver esa tienda
                            </button>
                          </div>
                        )}
                        <Button className="w-full" variante={avisar ? 'secondary' : 'primary'} aria-pressed={avisar} onClick={() => alternarAviso(p.id)}>
                          {avisar ? 'Listo, te avisaremos ✓' : 'Avísame cuando llegue'}
                        </Button>
                        {avisar && <p className="text-xs text-ink-muted">Te escribiremos por WhatsApp apenas repongan. Toca de nuevo para cancelar.</p>}
                      </div>
                    ) : (
                      <Button className="mt-auto" disabled={tope} onClick={() => agregarAlCarrito(p.id)}>
                        {tope ? 'Ya tienes todo el stock' : enCarrito ? `Agregar otro · llevas ${enCarrito}` : 'Agregar al carrito'}
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        <aside aria-label="Resumen del carrito" className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <h2 className="text-lg font-semibold">Tu carrito</h2>
            {carrito.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">Tu carrito está vacío. Agrega lo que necesites y lo recoges sin fila.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {carrito.map((i) => {
                  const p = getProducto(i.productoId)
                  if (!p) return null
                  const unit = precioUnitario(p.id, i.cantidad)
                  const max = stockTienda[p.id] ?? 0
                  return (
                    <li key={p.id} className="text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <ProductoFoto producto={p} className="size-9 shrink-0 rounded-md" emojiClase="text-lg" />
                          <span className="truncate">{p.nombre}</span>
                        </span>
                        <span className="font-medium">{formatSoles(unit * i.cantidad)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Quitar una unidad de ${p.nombre}`}
                          onClick={() => cambiarCantidad(p.id, i.cantidad - 1)}
                          className="size-9 rounded-md border border-line hover:border-ink-muted lg:size-7"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{i.cantidad}</span>
                        <button
                          type="button"
                          aria-label={`Agregar una unidad de ${p.nombre}`}
                          disabled={i.cantidad >= max}
                          onClick={() => cambiarCantidad(p.id, i.cantidad + 1)}
                          className="size-9 rounded-md border border-line hover:border-ink-muted disabled:text-ink-muted disabled:opacity-50 lg:size-7"
                        >
                          +
                        </button>
                        {p.precioVolumen && unit === p.precioVolumen && <Badge tono="ok">Precio por volumen</Badge>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm text-ink-muted">{unidades} unid.</span>
              <span className="text-lg font-semibold">{formatSoles(totalItems(carrito))}</span>
            </div>
            {carrito.length === 0 ? (
              <Button className="mt-3 w-full" disabled>
                Continuar al pedido
              </Button>
            ) : (
              <Link
                to="/pedido"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                Continuar al pedido
              </Link>
            )}
          </Card>
        </aside>
      </div>

      {unidades > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3 lg:hidden">
          <div className="text-sm">
            <p className="font-semibold">{formatSoles(totalItems(carrito))}</p>
            <p className="text-xs text-ink-muted">{unidades} unid. en tu carrito</p>
          </div>
          <Link to="/pedido" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
            Continuar al pedido
          </Link>
        </div>
      )}
    </div>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        activo ? 'border-brand bg-brand text-white' : 'border-line bg-surface hover:border-brand'
      }`}
    >
      {children}
    </button>
  )
}
