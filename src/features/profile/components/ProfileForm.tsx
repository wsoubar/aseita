import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import { Field, Input, Textarea } from '../../../components/ui/input'
import { Avatar } from '../../../components/ui/avatar'
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
  onSubmit: (values: ProfileValues) => Promise<void>
}) {
  const systems = useSystems()
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  })

  const avatarUrl = useWatch({ control, name: 'avatar_url' })
  const displayName = useWatch({ control, name: 'display_name' })

  async function submit(values: ProfileValues) {
    const available = await isUsernameAvailable(values.username, userId)
    if (!available) {
      setError('username', { message: 'Este nick já está em uso' })
      return
    }
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar src={avatarUrl || null} name={displayName || '?'} size={56} />
        <p className="text-xs text-muted">
          Avatar via URL externa — cole um link de imagem abaixo.
        </p>
      </div>

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

      <Field
        label="URL do avatar"
        error={errors.avatar_url?.message}
        htmlFor="avatar_url"
        hint="Opcional. Ex.: https://exemplo.com/foto.jpg"
      >
        <Input
          id="avatar_url"
          placeholder="https://..."
          {...register('avatar_url')}
        />
      </Field>

      <Field
        label="Sistema preferido"
        error={errors.preferred_system_id?.message}
        htmlFor="preferred_system_id"
      >
        <select
          id="preferred_system_id"
          className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
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
