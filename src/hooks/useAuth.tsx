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
        // TEMPORARY: Skip profile fetch and set default admin profile
        setProfile({
          id: session.user.id,
          email: session.user.email!,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setLoading(false)
        clearTimeout(timeoutId)
        // Uncomment below to re-enable profile fetching once we fix the issue
        // fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
      clearTimeout(timeoutId) // Clear timeout if we get a response
    }).catch((error) => {
      setLoading(false)
      clearTimeout(timeoutId)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          // TEMPORARY: Skip profile fetch and set default admin profile
          setProfile({
            id: session.user.id,
            email: session.user.email!,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          // Uncomment below to re-enable profile fetching once we fix the issue
          // await fetchProfile(session.user.id)
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
    console.log('fetchProfile: Starting for user:', userId)
    
    try {
      // Add timeout using Promise.race
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      console.log('fetchProfile: Query result:', { data, error })

      if (error && error.code === 'PGRST116') {
        console.log('fetchProfile: Profile not found, creating new one')
        // Profile doesn't exist, create one
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const newProfile = {
            id: userData.user.id,
            email: userData.user.email!,
            role: 'admin' as const
          }
          
          console.log('fetchProfile: Inserting new profile:', newProfile)
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single()

          console.log('fetchProfile: Insert result:', { createdProfile, createError })

          if (!createError) {
            setProfile(createdProfile)
          } else {
            console.error('Error creating profile:', createError)
          }
        }
      } else if (!error) {
        console.log('fetchProfile: Setting profile:', data)
        setProfile(data)
      } else {
        console.error('Error fetching profile:', error)
      }
    } catch (error) {
      console.error('Error fetching profile (possibly timeout):', error)
    } finally {
      console.log('fetchProfile: Setting loading to false')
      // Always set loading to false, regardless of success or failure
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
