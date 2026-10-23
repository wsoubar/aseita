import type { ReactNode } from 'react'
import { BookOpen } from 'lucide-react'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--color-accent)_17%,transparent),transparent_58%)] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <div className="w-full max-w-md space-y-7">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent shadow-[0_0_36px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]">
            <BookOpen className="size-7" strokeWidth={1.7} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-surface/95 p-6 shadow-2xl shadow-black/10 sm:p-7">
          {children}
        </div>
      </div>
    </div>
  )
}
