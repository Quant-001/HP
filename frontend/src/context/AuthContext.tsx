import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, getAuthData, setAuthData, clearAuthData } from '@/api/client'
import type { User, Hospital } from '@/types'

interface AuthState {
  user: User | null
  hospital: Hospital | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

interface RegisterData {
  hospital_name: string
  hospital_email: string
  admin_name: string
  admin_email: string
  password: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    hospital: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.me() as User
      setState(prev => ({
        ...prev,
        user,
        hospital: user.hospital_detail,
        isAuthenticated: true,
        isLoading: false,
      }))
    } catch {
      clearAuthData()
      setState({ user: null, hospital: null, isLoading: false, isAuthenticated: false })
    }
  }, [])

  useEffect(() => {
    const authData = getAuthData()
    if (authData?.access) {
      refreshUser()
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password }) as any
    setAuthData({ access: data.access, refresh: data.refresh })
    setState({
      user: data.user,
      hospital: data.user.hospital_detail,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const register = async (formData: RegisterData) => {
    const data = await authApi.register(formData) as any
    setAuthData({ access: data.access, refresh: data.refresh })
    setState({
      user: data.user,
      hospital: data.user.hospital_detail,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const logout = () => {
    clearAuthData()
    setState({ user: null, hospital: null, isLoading: false, isAuthenticated: false })
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
