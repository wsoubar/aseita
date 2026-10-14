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
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <BookOpen className="mx-auto size-8 text-accent" />
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
