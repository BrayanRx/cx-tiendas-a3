import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, PageHeader } from '@/components/ui'
import { categorias, getProducto, productos } from '@/data/productos'
import { getTienda, stock } from '@/data/tiendas'
import { precioUnitario, totalItems, useApp } from '@/lib/store'
import type { Categoria } from '@/lib/types'
import ProductoFoto from './ProductoFoto'

// Responsable: Ruth Amaya · rama feat/catalogo
// Lee: productos, categorias (@/data/productos), stock y tiendaId (@/data/tiendas, useApp)
// Escribe: agregarAlCarrito, cambiarCantidad (useApp)
const STOCK_BAJO = 8

export default function CatalogoPage() {
  const { tiendaId, carrito, agregarAlCarrito, cambiarCantidad } = useApp()
  const tienda = getTienda(tiendaId)
  const stockTienda = stock[tiendaId] ?? {}

  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas')
  const [soloPropia, setSoloPropia] = useState(false)
  const [busqueda, setBusqueda] = useState('')

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
    <div>
      <PageHeader
        titulo="Catálogo"
        descripcion={`Stock en tiempo real de ${tienda?.nombre ?? 'tu tienda'}. Elige y recoge sin hacer cola.`}
      >
        <Link to="/" className="text-sm text-brand hover:underline">
          Cambiar tienda
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Productos">
          <div className="mb-4 space-y-3">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto o marca"
              aria-label="Buscar producto"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
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
              <p className="text-sm text-ink-muted">No encontramos productos con esos filtros.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
              {visibles.map((p) => {
                const disponible = stockTienda[p.id] ?? 0
                const enCarrito = cantidadEn(p.id)
                const agotado = disponible === 0
                const tope = enCarrito >= disponible
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
                    <p className="text-lg font-semibold">S/ {p.precio.toFixed(2)}</p>
                    {p.precioVolumen && p.volumenMin && (
                      <p className="text-xs text-ok">
                        Bodegueros: S/ {p.precioVolumen.toFixed(2)} c/u desde {p.volumenMin} unid.
                      </p>
                    )}
                    <div className="mb-2 mt-1">
                      {agotado ? (
                        <Badge tono="bad">Agotado en esta tienda</Badge>
                      ) : disponible <= STOCK_BAJO ? (
                        <Badge tono="warn">Quedan {disponible}</Badge>
                      ) : (
                        <Badge tono="ok">{disponible} disponibles</Badge>
                      )}
                    </div>
                    <Button className="mt-auto" disabled={agotado || tope} onClick={() => agregarAlCarrito(p.id)}>
                      {agotado ? 'No disponible' : tope ? 'Máximo en stock' : enCarrito ? `Agregar otro (${enCarrito})` : 'Agregar al carrito'}
                    </Button>
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
              <p className="mt-2 text-sm text-ink-muted">Aún no agregas productos.</p>
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
                        <span className="font-medium">S/ {(unit * i.cantidad).toFixed(2)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Quitar una unidad de ${p.nombre}`}
                          onClick={() => cambiarCantidad(p.id, i.cantidad - 1)}
                          className="size-7 rounded-md border border-line hover:border-ink-muted"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{i.cantidad}</span>
                        <button
                          type="button"
                          aria-label={`Agregar una unidad de ${p.nombre}`}
                          disabled={i.cantidad >= max}
                          onClick={() => cambiarCantidad(p.id, i.cantidad + 1)}
                          className="size-7 rounded-md border border-line hover:border-ink-muted disabled:text-ink-muted disabled:opacity-50"
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
              <span className="text-lg font-semibold">S/ {totalItems(carrito).toFixed(2)}</span>
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
