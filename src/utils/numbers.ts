const INTEGER = new Intl.NumberFormat('es-CL')
const DECIMAL = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 })

/** 14210 → "14.210". */
export function formatInteger(value: number): string {
  return INTEGER.format(value)
}

/** 14.2 → "+14,2 %". */
export function formatChange(value: number): string {
  return `${value > 0 ? '+' : ''}${DECIMAL.format(value)} %`
}
