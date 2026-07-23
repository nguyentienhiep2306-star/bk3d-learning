import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/database'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) {
      console.error('Không tải được hồ sơ')
      setProfile(null)
      return
    }
    setProfile(data as Profile | null)
  }

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id)
  }, [session?.user.id])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session?.user.id) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user.id) {
         loadProfile(nextSession.user.id).then(() => setLoading(false))
       } else {
         setProfile(null)
         setLoading(false)
       }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [loading, profile, refreshProfile, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
