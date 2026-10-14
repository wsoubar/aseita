import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ToastContext } from './toast-context'
import type { ToastKind } from './toast-context'

interface Toast {
  id: number
  message: string
  kind: ToastKind
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, kind }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => {
          const Icon = icons[t.kind]
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg',
                t.kind === 'error'
                  ? 'border-danger/40 bg-surface text-danger'
                  : 'border-line bg-surface text-ink',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
