const INTEGER = new Intl.NumberFormat('es-CL')

/** 14210 → "14.210". */
export function formatInteger(value: number): string {
  return INTEGER.format(value)
}
