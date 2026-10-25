import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import { Field, Input, Textarea } from '../../../components/ui/input'
import { ImageUploadField } from '../../../components/ui/image-upload-field'
import { profileSchema } from '../../../lib/schemas'
import type { ProfileValues } from '../../../lib/schemas'
import { useSystems } from '../../systems/api'
import { isUsernameAvailable } from '../../auth/api'

export function ProfileForm({
  userId,
  defaultValues,
  submitLabel,
  lockUsername = false,
  onSubmit,
}: {
  userId: string
  defaultValues: ProfileValues
  submitLabel: string
  lockUsername?: boolean
  onSubmit: (
    values: ProfileValues,
    image: { file: File | null; remove: boolean },
  ) => Promise<void>
}) {
  const systems = useSystems()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  async function submit(values: ProfileValues) {
    try {
      const available = await isUsernameAvailable(values.username, userId)
      if (!available) {
        setError('username', { message: 'Este nick já está em uso' })
        return
      }
      await onSubmit(values, { file: imageFile, remove: removeImage })
    } catch {
      setError('root.server', {
        message: 'Não foi possível validar ou salvar o perfil. Tente novamente.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {errors.root?.server?.message && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.server.message}
        </p>
      )}
      <ImageUploadField
        label="Imagem do perfil"
        src={defaultValues.avatar_url || null}
        shape="avatar"
        file={imageFile}
        onFileChange={setImageFile}
        remove={removeImage}
        onRemoveChange={setRemoveImage}
      />

      <Field
        label="Nick (@)"
        error={errors.username?.message}
        htmlFor="username"
        hint={lockUsername ? 'O nick não pode ser alterado.' : undefined}
      >
        <Input id="username" disabled={lockUsername} {...register('username')} />
      </Field>

      <Field
        label="Nome de exibição"
        error={errors.display_name?.message}
        htmlFor="display_name"
      >
        <Input id="display_name" {...register('display_name')} />
      </Field>

      <input type="hidden" {...register('avatar_url')} />

      <Field
        label="Sistema preferido"
        error={errors.preferred_system_id?.message}
        htmlFor="preferred_system_id"
      >
        <select
          id="preferred_system_id"
          className="form-control"
          {...register('preferred_system_id')}
        >
          <option value="">Nenhum</option>
          {systems.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Bio" error={errors.bio?.message} htmlFor="bio">
        <Textarea
          id="bio"
          maxLength={300}
          placeholder="Conte um pouco sobre você e seus jogos favoritos."
          {...register('bio')}
        />
      </Field>

      <Button type="submit" loading={isSubmitting} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
