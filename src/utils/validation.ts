/** Dominios de correo institucional UC aceptados. */
const UC_EMAIL = /^[^\s@]+@(uc\.cl|estudiante\.uc\.cl)$/i

export const MIN_PASSWORD_LENGTH = 8

export function isUcEmail(email: string): boolean {
  return UC_EMAIL.test(email.trim())
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Ingresa tu correo institucional.'
  if (!isUcEmail(email)) return 'Usa tu correo @uc.cl o @estudiante.uc.cl.'
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Ingresa tu contraseña.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  return undefined
}
