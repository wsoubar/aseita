import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { getProfile } from './api'
import { AuthContext } from './context'
import type { AuthContextValue } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId as string),
    enabled: Boolean(userId),
  })

  const value = useMemo<AuthContextValue>(() => {
    const profile = profileQuery.data ?? null
    return {
      session,
      user: session?.user ?? null,
      profile,
      loading: authLoading || (Boolean(userId) && profileQuery.isLoading),
      needsOnboarding: Boolean(profile) && !profile?.onboarded,
      refetchProfile: () => void profileQuery.refetch(),
    }
  }, [session, authLoading, userId, profileQuery])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
