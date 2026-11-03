import { useEffect } from 'react'
import { useApp } from './store'
import type { Pedido, RespuestaNps } from './types'

// Clave con la que el store se guarda en localStorage (ver `persist` en store.ts).
const CLAVE_STORE = 'cx-pide-y-recoge'

// Sincroniza los datos compartidos entre pestañas del mismo navegador, para la demo con dos pestañas:
// el cliente pide en una y el Panel lo ve al instante en la otra (y viceversa con los avances y el NPS).
// Solo se copian pedidos, encuestas y puntos: el carrito y la tienda de cada pestaña no cambian, y la sesión
// ni siquiera se comparte (vive en sessionStorage, ver store.ts).
// Se usa una sola vez, en el Layout.
export function useSincronizarPestanas() {
  useEffect(() => {
    const alCambiar = (e: StorageEvent) => {
      if (e.key !== CLAVE_STORE || !e.newValue) return
      try {
        const estado = (JSON.parse(e.newValue) as { state?: { pedidos?: Pedido[]; encuestas?: RespuestaNps[]; puntos?: number } }).state
        if (!estado) return
        const actual = useApp.getState()
        const cambios: Partial<{ pedidos: Pedido[]; encuestas: RespuestaNps[]; puntos: number }> = {}
        // Solo se actualiza lo que de verdad cambió; así las pestañas no se reescriben entre sí en bucle.
        if (estado.pedidos && JSON.stringify(estado.pedidos) !== JSON.stringify(actual.pedidos)) cambios.pedidos = estado.pedidos
        if (estado.encuestas && JSON.stringify(estado.encuestas) !== JSON.stringify(actual.encuestas)) cambios.encuestas = estado.encuestas
        if (typeof estado.puntos === 'number' && estado.puntos !== actual.puntos) cambios.puntos = estado.puntos
        if (Object.keys(cambios).length) useApp.setState(cambios)
      } catch {
        // Dato ilegible: se ignora y se mantiene lo que ya se muestra.
      }
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])
}
