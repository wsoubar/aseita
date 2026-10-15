import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import { Field, Input } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/toast-context'
import { loginSchema } from '../../../lib/schemas'
import type { LoginValues } from '../../../lib/schemas'
import { AuthShell } from '../components/AuthShell'
import { auth } from '../api'

export function LoginPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    setFormError(null)
    const { error } = await auth.signIn(values.email, values.password)
    if (error) {
      setFormError('E-mail ou senha inválidos.')
      return
    }
    navigate('/')
  }

  async function handleGoogle() {
    const { error } = await auth.signInWithGoogle()
    if (error) show('Não foi possível entrar com Google', 'error')
  }

  async function handleReset() {
    const email = getValues('email')
    if (!email) {
      setFormError('Informe o e-mail para recuperar a senha.')
      return
    }
    const { error } = await auth.resetPassword(email)
    if (error) show('Erro ao enviar e-mail', 'error')
    else show('Enviamos um link de recuperação para seu e-mail.', 'success')
  }

  return (
    <AuthShell
      title="A Seita"
      subtitle="Entre para gerenciar seus personagens e participar da comunidade."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="E-mail" error={errors.email?.message} htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
        </Field>
        <Field label="Senha" error={errors.password?.message} htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
        </Field>

        {formError && <p className="text-sm text-danger">{formError}</p>}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Entrar
        </Button>
      </form>

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogle}
        className="mt-3 w-full"
      >
        Entrar com Google
      </Button>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <button
          type="button"
          onClick={handleReset}
          className="hover:text-ink"
        >
          Esqueci a senha
        </button>
        <Link to="/register" className="hover:text-ink">
          Criar conta
        </Link>
      </div>
    </AuthShell>
  )
}
