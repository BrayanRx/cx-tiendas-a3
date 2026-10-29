const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export const formatSoles = (monto: number) => soles.format(monto)

export const formatHora = (ms: number) =>
  new Date(ms).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

export const formatFecha = (ms: number) =>
  new Date(ms).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
