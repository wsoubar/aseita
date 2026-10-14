import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { CharacterValues } from '../../lib/schemas'
import type {
  Character,
  CharacterWithSystem,
  ProfileRef,
} from '../../types'

export interface CharacterDetail extends CharacterWithSystem {
  owner: ProfileRef
}

const SELECT = '*, system:systems(*)'

export async function listCharacters(filters: {
  search?: string
  systemId?: string
}): Promise<CharacterWithSystem[]> {
  let query = supabase.from('characters').select(SELECT)
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }
  if (filters.systemId) {
    query = query.eq('system_id', filters.systemId)
  }
  const { data, error } = await query
    .order('like_count', { ascending: false })
    .limit(60)
  if (error) throw error
  return data as unknown as CharacterWithSystem[]
}

export function useCharacters(filters: { search?: string; systemId?: string }) {
  return useQuery({
    queryKey: ['characters', filters],
    queryFn: () => listCharacters(filters),
  })
}

export function useMyCharacters(ownerId?: string) {
  return useQuery({
    queryKey: ['characters', 'owner', ownerId],
    enabled: Boolean(ownerId),
    queryFn: async (): Promise<CharacterWithSystem[]> => {
      const { data, error } = await supabase
        .from('characters')
        .select(SELECT)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as CharacterWithSystem[]
    },
  })
}

export function useCharacter(id?: string) {
  return useQuery({
    queryKey: ['character', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<CharacterDetail> => {
      const { data, error } = await supabase
        .from('characters')
        .select(
          `${SELECT}, owner:profiles!characters_owner_id_fkey(id, username, display_name, avatar_url)`,
        )
        .eq('id', id)
        .single()
      if (error) throw error
      return data as unknown as CharacterDetail
    },
  })
}

function toRow(values: CharacterValues, data: Record<string, string>) {
  return {
    name: values.name,
    system_id: values.system_id,
    description: values.description || null,
    image_url: values.image_url || null,
    data,
  }
}

export function useCreateCharacter(ownerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      values: CharacterValues
      data: Record<string, string>
    }): Promise<Character> => {
      const { data, error } = await supabase
        .from('characters')
        .insert({ ...toRow(input.values, input.data), owner_id: ownerId })
        .select('*')
        .single()
      if (error) throw error
      return data as Character
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['characters'] })
    },
  })
}

export function useUpdateCharacter(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      values: CharacterValues
      data: Record<string, string>
    }) => {
      const { error } = await supabase
        .from('characters')
        .update(toRow(input.values, input.data))
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['characters'] })
      void queryClient.invalidateQueries({ queryKey: ['character', id] })
    },
  })
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('characters').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['characters'] })
    },
  })
}
