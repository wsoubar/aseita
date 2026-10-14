import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../components/ui/button'
import { Field, Input } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/toast-context'
import { registerSchema } from '../../../lib/schemas'
import type { LoginValues } from '../../../lib/schemas'
import { AuthShell } from '../components/AuthShell'
import { auth } from '../api'

export function RegisterPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: LoginValues) {
    setFormError(null)
    const { data, error } = await auth.signUp(values.email, values.password)
    if (error) {
      setFormError(error.message)
      return
    }
    if (data.session) {
      navigate('/onboarding')
    } else {
      setEmailSent(true)
    }
  }

  async function handleGoogle() {
    const { error } = await auth.signInWithGoogle()
    if (error) show('Não foi possível entrar com Google', 'error')
  }

  if (emailSent) {
    return (
      <AuthShell title="Confirme seu e-mail" subtitle="Falta pouco!">
        <p className="text-sm text-muted">
          Enviamos um link de confirmação para o seu e-mail. Confirme para
          ativar sua conta e depois faça login.
        </p>
        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => navigate('/login')}
        >
          Ir para o login
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Cadastre-se para criar fichas e interagir no feed."
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
        <Field
          label="Senha"
          error={errors.password?.message}
          htmlFor="password"
          hint="Mínimo de 8 caracteres."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
          />
        </Field>

        {formError && <p className="text-sm text-danger">{formError}</p>}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Criar conta
        </Button>
      </form>

      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogle}
        className="mt-3 w-full"
      >
        Criar com Google
      </Button>

      <p className="mt-4 text-center text-xs text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="text-ink hover:text-accent">
          Entrar
        </Link>
      </p>
    </AuthShell>
  )
}
