import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Spinner } from './spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg shadow-sm shadow-accent/10 hover:brightness-110 active:brightness-95',
  secondary: 'border border-line bg-surface-2 text-ink hover:border-muted hover:bg-surface-2/80 active:brightness-95',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink active:brightness-95',
  danger: 'bg-danger text-danger-fg hover:brightness-110 active:brightness-95',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 rounded-lg px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

function buttonClassName(
  variant: Variant,
  size: Size,
  className?: string,
) {
  return cn(
    'inline-flex items-center justify-center rounded-xl font-medium no-underline transition-all duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    variants[variant],
    sizes[size],
    className,
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonClassName(variant, size, className), 'disabled:cursor-not-allowed disabled:opacity-50')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  )
}

type ButtonLinkProps = Omit<LinkProps, 'className' | 'children'> & {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName(variant, size, className)}
      {...props}
    >
      {icon}
      {children}
    </Link>
  )
}
