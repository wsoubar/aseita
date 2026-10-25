import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from './button'
import { Field, Input } from './input'
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_PIXELS,
  validateImageFile,
} from '../../lib/image-storage'

export function ImageUploadField({
  label,
  src,
  shape = 'wide',
  file,
  onFileChange,
  remove,
  onRemoveChange,
}: {
  label: string
  src: string | null
  shape?: 'avatar' | 'wide'
  file: File | null
  onFileChange: (file: File | null) => void
  remove: boolean
  onRemoveChange: (remove: boolean) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>()
  const previewRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  function clearPreview() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = null
    setPreview(null)
  }

  async function selectFile(selected: File | undefined) {
    if (!selected) return
    const validationError = await validateImageFile(selected)
    if (validationError) {
      setError(validationError)
      clearPreview()
      onFileChange(null)
      return
    }
    clearPreview()
    const objectUrl = URL.createObjectURL(selected)
    previewRef.current = objectUrl
    setPreview(objectUrl)
    setError(undefined)
    onRemoveChange(false)
    onFileChange(selected)
  }

  const imageSrc = preview ?? (!remove ? src : null)

  return (
    <Field
      label={label}
      htmlFor={`image-upload-${shape}`}
      error={error}
      hint={`JPEG, PNG ou WebP · até ${IMAGE_MAX_BYTES / 1024 / 1024} MB · ${IMAGE_MAX_PIXELS / 1_000_000} MP. Avatares serão reduzidos a 512 px; personagens a 1600 px.`}
    >
      <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2/50 p-3">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Prévia da imagem"
            className={
              shape === 'avatar'
                ? 'size-14 shrink-0 rounded-full object-cover'
                : 'h-20 w-28 shrink-0 rounded-lg object-cover'
            }
          />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ImagePlus className="size-5" />
          </span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={`image-upload-${shape}`}
            className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-line bg-surface px-3 text-sm font-medium hover:bg-surface-2"
          >
            Escolher imagem
          </label>
          <Input
            id={`image-upload-${shape}`}
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            onChange={(event) => {
              void selectFile(event.currentTarget.files?.[0])
              event.currentTarget.value = ''
            }}
          />
          {(src || file) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={
                remove ? (
                  <ImagePlus className="size-4" />
                ) : (
                  <X className="size-4" />
                )
              }
              onClick={() => {
                if (remove) {
                  onRemoveChange(false)
                } else if (file) {
                  clearPreview()
                  onFileChange(null)
                } else {
                  onRemoveChange(true)
                }
                setError(undefined)
              }}
            >
              {remove
                ? 'Manter imagem atual'
                : file
                  ? 'Cancelar seleção'
                  : 'Remover'}
            </Button>
          )}
        </div>
      </div>
    </Field>
  )
}
