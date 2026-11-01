import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LogOut, Trash2 } from 'lucide-react'
import { Button } from './button'

export function ConfirmDialog({
  open, title, description, loading = false, confirmLabel = 'Excluir', intent = 'delete', onCancel, onConfirm,
}: {
  open: boolean
  title: string
  description: string
  loading?: boolean
  confirmLabel?: string
  intent?: 'delete' | 'logout'
  onCancel: () => void
  onConfirm: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    const dialog = ref.current
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={loading}
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onCancel()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-line bg-surface p-6 text-center text-ink shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm"
    >
      <div className={`mx-auto mb-4 flex size-12 items-center justify-center rounded-full ${intent === 'delete' ? 'bg-danger/10 text-danger' : 'bg-accent-soft text-accent'}`}>
        {intent === 'delete' ? <Trash2 className="size-5" /> : <LogOut className="size-5" />}
      </div>
      <h2 id={titleId} className="font-display text-lg font-semibold">{title}</h2>
      <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button autoFocus variant="secondary" disabled={loading} onClick={onCancel}>Cancelar</Button>
        <Button variant={intent === 'delete' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </dialog>,
    document.body,
  )
}
