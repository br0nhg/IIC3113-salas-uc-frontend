import { Link, type LinkProps } from 'react-router-dom'
import { buttonClasses, type ButtonStyleOptions } from './buttonStyles'
import Icon from './Icon'

interface ButtonLinkProps extends LinkProps, ButtonStyleOptions {
  icon?: string
}

/** Enlace de React Router con apariencia de botón. */
export default function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  icon,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {icon && <Icon name={icon} className="text-[18px]" />}
      {children}
    </Link>
  )
}
