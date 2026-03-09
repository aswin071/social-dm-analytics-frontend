import { createContext, useContext, useState } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ username: 'demo', email: 'demo@example.com' })
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    const { data } = await authAPI.login({ username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const { data: userData } = await authAPI.me()
    setUser(userData)
    return userData
  }

  const register = async (username, email, password) => {
    await authAPI.register({ username, email, password, password_confirm: password })
    return login(username, password)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
