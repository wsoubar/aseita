import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Field, Input } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/toast-context'
import { updateProfile } from '../../auth/api'
import { useAuth } from '../../auth/context'
import { ProfileForm } from '../../profile/components/ProfileForm'
import { supabase } from '../../../lib/supabase'
import type { ProfileValues } from '../../../lib/schemas'

export function SettingsPage() {
  const { user, profile, refetchProfile } = useAuth()
  const { show } = useToast()
  const [password, setPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  if (!user || !profile) return null

  async function handleSubmit(values: ProfileValues) {
    try {
      await updateProfile(user!.id, values)
      refetchProfile()
      show('Perfil atualizado.', 'success')
    } catch {
      show('Não foi possível atualizar o perfil.', 'error')
    }
  }

  async function changePassword() {
    if (password.length < 8) {
      show('A senha precisa de ao menos 8 caracteres.', 'error')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSavingPassword(false)
    if (error) show('Não foi possível alterar a senha.', 'error')
    else {
      setPassword('')
      show('Senha alterada.', 'success')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">Configurações</h1>
        <Link
          to={`/u/${profile.username}`}
          className="flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          Ver perfil público
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">Perfil</h2>
        <ProfileForm
          userId={user.id}
          submitLabel="Salvar alterações"
          defaultValues={{
            username: profile.username,
            display_name: profile.display_name,
            bio: profile.bio ?? '',
            avatar_url: profile.avatar_url ?? '',
            preferred_system_id: profile.preferred_system_id ?? '',
          }}
          onSubmit={handleSubmit}
        />
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg font-semibold">Conta</h2>
        <Field label="E-mail" htmlFor="account-email">
          <Input id="account-email" value={user.email ?? ''} disabled readOnly />
        </Field>
        <Field label="Nova senha" htmlFor="new-password">
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Deixe em branco para manter"
          />
        </Field>
        <Button
          variant="secondary"
          onClick={changePassword}
          loading={savingPassword}
          disabled={!password}
        >
          Alterar senha
        </Button>
      </Card>
    </div>
  )
}
