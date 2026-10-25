import { Navigate, useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/ui/toast-context'
import { profileSaveErrorMessage, updateProfile } from '../../auth/api'
import { useAuth } from '../../auth/context'
import { AuthShell } from '../../auth/components/AuthShell'
import { ProfileForm } from '../../profile/components/ProfileForm'
import type { ProfileValues } from '../../../lib/schemas'

export function OnboardingPage() {
  const { user, profile, refetchProfile, needsOnboarding } = useAuth()
  const navigate = useNavigate()
  const { show } = useToast()

  if (!user) return <Navigate to="/login" replace />
  if (!needsOnboarding) return <Navigate to="/" replace />

  async function handleSubmit(
    values: ProfileValues,
    image: { file: File | null; remove: boolean },
  ) {
    try {
      await updateProfile(user!.id, values, true, image)
      refetchProfile()
      show('Perfil pronto! Bem-vindo à Seita.', 'success')
      navigate('/')
    } catch (error) {
      show(profileSaveErrorMessage(error), 'error')
    }
  }

  return (
    <AuthShell
      title="Complete seu perfil"
      subtitle="Escolha como você será visto na comunidade."
    >
      <ProfileForm
        userId={user.id}
        submitLabel="Começar"
        defaultValues={{
          username: '',
          display_name: profile?.display_name ?? '',
          bio: profile?.bio ?? '',
          avatar_url: profile?.avatar_url ?? '',
          preferred_system_id: profile?.preferred_system_id ?? '',
        }}
        onSubmit={handleSubmit}
      />
    </AuthShell>
  )
}
