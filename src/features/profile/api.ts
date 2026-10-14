import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { PublicProfile } from '../../types'

export async function getPublicProfile(
  username: string,
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, preferred_system:systems(*)')
    .eq('username', username)
    .maybeSingle()
  if (error) throw error
  return data as unknown as PublicProfile | null
}

export function usePublicProfile(username?: string) {
  return useQuery({
    queryKey: ['public-profile', username],
    enabled: Boolean(username),
    queryFn: () => getPublicProfile(username as string),
  })
}
