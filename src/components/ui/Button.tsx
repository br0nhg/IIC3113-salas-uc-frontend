import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonStyleOptions } from './buttonStyles'
import Icon from './Icon'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  /** Ícono de Material Symbols antes del texto. */
  icon?: string
  loading?: boolean
}

export default function Button({
  variant,
  size,
  fullWidth,
  className,
  icon,
  loading = false,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <Spinner /> : icon && <Icon name={icon} className="text-[18px]" />}
      {children}
    </button>
  )
}
