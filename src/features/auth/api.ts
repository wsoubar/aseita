import { supabase } from '../../lib/supabase'
import type { ProfileValues } from '../../lib/schemas'
import type { Profile } from '../../types'

export async function getProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function updateProfile(
  id: string,
  values: ProfileValues,
  markOnboarded = false,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: values.username,
      display_name: values.display_name,
      bio: values.bio || null,
      avatar_url: values.avatar_url || null,
      preferred_system_id: values.preferred_system_id || null,
      ...(markOnboarded ? { onboarded: true } : {}),
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as Profile
}

export async function isUsernameAvailable(
  username: string,
  exceptId?: string,
): Promise<boolean> {
  let query = supabase.from('profiles').select('id').eq('username', username)
  if (exceptId) query = query.neq('id', exceptId)
  const { data, error } = await query.limit(1)
  if (error) throw error
  return (data ?? []).length === 0
}

export const auth = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    }),
  signOut: () => supabase.auth.signOut(),
  resetPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    }),
}
