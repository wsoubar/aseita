import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import { Field, Input, PasswordInput } from '../../../components/ui/input'
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
          <PasswordInput
            id="password"
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
        <GoogleMark />
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

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-4">
      <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h13.2a11.3 11.3 0 0 1-4.9 7.4l7.7 6C44.5 38 47.5 31.9 47.5 24.5Z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.7l-7.7-6c-2.1 1.4-4.8 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9l-8 6.2C6.5 42.6 14.6 48 24 48Z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.3l-8-6.2a24 24 0 0 0 0 21.7l8-6.2Z" />
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.8C35.9 2.4 30.5 0 24 0 14.6 0 6.5 5.4 2.5 13.2l8 6.2C12.4 13.7 17.7 9.5 24 9.5Z" />
    </svg>
  )
}
