import { supabase } from '../../lib/supabase'
import type { ProfileValues } from '../../lib/schemas'
import type { Profile } from '../../types'
import {
  removeUploadedImageBestEffort,
  uploadImage,
} from '../../lib/image-storage'

export function profileSaveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()
  if (normalized.includes('bucket not found')) {
    return 'O armazenamento de imagens ainda não foi configurado. Aplique a migração atualizada do Supabase e tente novamente.'
  }
  if (
    normalized.includes('row-level security') ||
    normalized.includes('permission denied') ||
    normalized.includes('not authorized')
  ) {
    return 'O Supabase bloqueou o upload. Confira se a migração do bucket e das políticas de Storage foi aplicada.'
  }
  if (normalized.includes('duplicate key') || normalized.includes('unique constraint')) {
    return 'Este nick já está em uso.'
  }
  return 'Não foi possível salvar o perfil. Tente novamente.'
}

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
  image?: { file: File | null; remove: boolean },
): Promise<Profile> {
  const previousAvatarUrl =
    image?.file || image?.remove ? (await getProfile(id))?.avatar_url : null
  let avatarUrl = values.avatar_url || null
  let uploadedUrl: string | null = null
  if (image?.file) {
    uploadedUrl = await uploadImage(id, 'avatars', image.file)
    avatarUrl = uploadedUrl
  } else if (image?.remove) {
    avatarUrl = null
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: values.username,
      display_name: values.display_name,
      bio: values.bio || null,
      avatar_url: avatarUrl,
      preferred_system_id: values.preferred_system_id || null,
      ...(markOnboarded ? { onboarded: true } : {}),
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    removeUploadedImageBestEffort(uploadedUrl)
    throw error
  }
  if (image?.file || image?.remove) {
    removeUploadedImageBestEffort(previousAvatarUrl)
  }
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
