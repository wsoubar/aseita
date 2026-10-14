import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { System } from '../../types'

export async function listSystems(): Promise<System[]> {
  const { data, error } = await supabase
    .from('systems')
    .select('*')
    .order('name')
  if (error) throw error
  return data as System[]
}

export function useSystems() {
  return useQuery({
    queryKey: ['systems'],
    queryFn: listSystems,
    staleTime: Infinity,
  })
}
