import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '@/config/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await supabase.from('profiles').select('count').limit(1)
      } catch (error) {
        console.error('AuthProvider: Supabase connection test failed:', error)
      }
    }
    testConnection()
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {

      setLoading(false)
    }, 10000) // 10 seconds timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        clearTimeout(timeoutId)
      } else {
        setLoading(false)
      }
      clearTimeout(timeoutId)
    }).catch(() => {
      setLoading(false)
      clearTimeout(timeoutId)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error && error.code === 'PGRST116') {
        // No profile row yet — create one with default admin role
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const newProfile = {
            id: userData.user.id,
            email: userData.user.email!,
            role: 'admin' as const
          }
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()

          if (!createError) {
            setProfile(createdProfile)
          } else {
            console.error('Error creating profile:', createError)
          }
        }
      } else if (!error) {
        setProfile(data)
      } else {
        console.error('Error fetching profile:', error)
      }
    } catch (error) {
      console.error('Error fetching profile (possibly timeout):', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
