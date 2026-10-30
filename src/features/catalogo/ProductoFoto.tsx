import { useState } from 'react'
import type { Producto } from '@/lib/types'

// Foto real del producto; si no existe o no carga, muestra el emoji provisional.
export default function ProductoFoto({ producto, className = '', emojiClase = 'text-4xl' }: { producto: Producto; className?: string; emojiClase?: string }) {
  const [fallo, setFallo] = useState(false)

  if (!producto.foto || fallo) {
    return (
      <span className={`grid place-items-center bg-canvas ${emojiClase} ${className}`} role="img" aria-label={`${producto.nombre} ${producto.presentacion}`}>
        {producto.imagen}
      </span>
    )
  }
  return (
    <img
      src={producto.foto}
      alt={`${producto.nombre} ${producto.presentacion}`}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`bg-canvas object-cover ${className}`}
    />
  )
}
