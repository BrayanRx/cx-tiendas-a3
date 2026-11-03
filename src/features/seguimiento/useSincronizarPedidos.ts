import { useEffect } from 'react'
import { useApp } from '@/lib/store'
import type { Pedido } from '@/lib/types'

// Clave con la que el store se guarda en localStorage (ver `persist` en src/lib/store.ts).
const CLAVE_STORE = 'cx-pide-y-recoge'

// Cuando el Panel avanza un pedido en otra pestaña, el cliente lo ve al instante sin recargar.
// Solo se copian los pedidos: la sesión de esta pestaña no cambia.
export function useSincronizarPedidos() {
  useEffect(() => {
    const alCambiar = (e: StorageEvent) => {
      if (e.key !== CLAVE_STORE || !e.newValue) return
      try {
        const pedidos = (JSON.parse(e.newValue) as { state?: { pedidos?: Pedido[] } }).state?.pedidos
        if (pedidos) useApp.setState({ pedidos })
      } catch {
        // Dato ilegible: se ignora y se mantiene lo que ya se muestra.
      }
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])
}
