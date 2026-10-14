import { cn, initials } from '../../lib/utils'

export function Avatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null
  name: string
  size?: number
  className?: string
}) {
  const style = { width: size, height: size }
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={cn('shrink-0 rounded-full object-cover', className)}
        style={style}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-medium text-accent',
        className,
      )}
      style={{ ...style, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  )
}
