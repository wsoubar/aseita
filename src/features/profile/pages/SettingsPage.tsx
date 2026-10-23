import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { PageHeading } from '../../../components/ui/page-heading'
import { Field, Input, PasswordInput } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/toast-context'
import { updateProfile } from '../../auth/api'
import { useAuth } from '../../auth/context'
import { ProfileForm } from '../../profile/components/ProfileForm'
import { supabase } from '../../../lib/supabase'
import { cn } from '../../../lib/utils'
import { useTheme } from '../../../lib/theme'
import type { ThemePref } from '../../../lib/theme'
import type { ProfileValues } from '../../../lib/schemas'

const themeOptions: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
]

export function SettingsPage() {
  const { user, profile, refetchProfile } = useAuth()
  const { show } = useToast()
  const { pref, setPref } = useTheme()
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
    <div className="space-y-7">
      <PageHeading
        title="Configurações"
        description="Personalize seu perfil e sua experiência."
        action={
          <Link
            to={`/u/${profile.username}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-accent"
          >
            Ver perfil público
            <ArrowUpRight className="size-4" />
          </Link>
        }
      />

      <Card className="p-5 sm:p-7">
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

      <Card className="space-y-4 p-5 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Aparência</h2>
        <p className="text-sm text-muted">
          Escolha o tema. &quot;Sistema&quot; acompanha a preferência do seu
          dispositivo.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPref(value)}
              aria-pressed={pref === value}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                pref === value
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line bg-surface text-muted hover:border-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-5 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Conta</h2>
        <Field label="E-mail" htmlFor="account-email">
          <Input id="account-email" value={user.email ?? ''} disabled readOnly />
        </Field>
        <Field label="Nova senha" htmlFor="new-password">
          <PasswordInput
            id="new-password"
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
