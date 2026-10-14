import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { RankingRow } from '../../types'

export async function listRanking(systemId?: string): Promise<RankingRow[]> {
  let query = supabase.from('character_rankings').select('*')
  if (systemId) query = query.eq('system_id', systemId)
  const { data, error } = await query
    .order('score', { ascending: false })
    .order('name')
    .limit(100)
  if (error) throw error
  return data as unknown as RankingRow[]
}

export function useRanking(systemId?: string) {
  return useQuery({
    queryKey: ['ranking', systemId ?? 'all'],
    queryFn: () => listRanking(systemId),
  })
}
