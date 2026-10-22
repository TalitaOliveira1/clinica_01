import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getToken, setToken } from '../services/api.js'
import { getProfile, login as loginRequest } from '../services/auth.service.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))

  useEffect(() => {
    let active = true

    async function restoreSession() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const data = await getProfile()
        if (active) setUser(data.user)
      } catch {
        setToken(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    function handleUnauthorized() {
      setUser(null)
    }

    restoreSession()
    window.addEventListener('clinica:unauthorized', handleUnauthorized)

    return () => {
      active = false
      window.removeEventListener('clinica:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await loginRequest({ email, password })
    setToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
