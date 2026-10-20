/** Une clases CSS ignorando valores vacíos o falsos. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
