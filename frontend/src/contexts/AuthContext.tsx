import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from '../api/auth'

import type { User } from '../types/api'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

function getStoredUser(): User | null {
  const stored = localStorage.getItem('auth_user')

  if (!stored) {
    return null
  }

  try {
    const parsed = JSON.parse(stored)
    // Handle cases where the stored object was nested under 'data'
    return parsed?.data ? (parsed.data as User) : (parsed as User)
  } catch {
    localStorage.removeItem('auth_user')
    return null
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(getStoredUser)

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token'),
  )

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('auth_token')

      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await getMe()

        // Unwrap .data if wrapped by API resource response
        const currentUser: User = (response as any)?.data
          ? (response as any).data
          : response

        setUser(currentUser)

        localStorage.setItem(
          'auth_user',
          JSON.stringify(currentUser),
        )
      } catch (error) {
        console.warn('Session restoration failed:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')

        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    function handleAuthExpired() {
      setToken(null)
      setUser(null)
    }

    window.addEventListener('auth:expired', handleAuthExpired)

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired)
    }
  }, [])

  async function login(payload: LoginPayload) {
    const response = await loginRequest(payload)

    // Ensure raw user object is unwrapped
    const userPayload: User = (response.user as any)?.data
      ? (response.user as any).data
      : response.user

    localStorage.setItem('auth_token', response.token)
    localStorage.setItem('auth_user', JSON.stringify(userPayload))

    setToken(response.token)
    setUser(userPayload)

    return userPayload
  }

  async function register(payload: RegisterPayload) {
    const response = await registerRequest(payload)

    const userPayload: User = (response.user as any)?.data
      ? (response.user as any).data
      : response.user

    localStorage.setItem('auth_token', response.token)
    localStorage.setItem('auth_user', JSON.stringify(userPayload))

    setToken(response.token)
    setUser(userPayload)

    return userPayload
  }

  async function logout() {
    try {
      if (token) {
        await logoutRequest()
      }
    } catch (error) {
      console.warn('Logout API call failed or token expired:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}