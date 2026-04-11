import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data.data))
        .catch(() => { localStorage.clear(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { user, access_token, refresh_token } = res.data.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(user)
    return user
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    const { user, access_token, refresh_token } = res.data.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)