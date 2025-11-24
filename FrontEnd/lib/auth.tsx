"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  name: string
  email: string
  subscription: "active" | "inactive" | "expired"
  subscriptionExpiry?: Date
  role?: "client" | "admin" | "affiliate"
  defaultRoute?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const mockAccounts: Array<User & { password: string }> = [
    {
      id: "1",
      name: "Marina Ferreira",
      email: "cliente.demo@opta.com",
      subscription: "active",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      role: "client",
      defaultRoute: "/dashboard",
      password: "usuario@123",
    },
    {
      id: "2",
      name: "João Viana",
      email: "afiliado.demo@opta.com",
      subscription: "active",
      subscriptionExpiry: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      role: "affiliate",
      defaultRoute: "/painel/afiliados",
      password: "afiliado@123",
    },
    {
      id: "3",
      name: "Eduardo Gomes",
      email: "admin.demo@opta.com",
      subscription: "active",
      subscriptionExpiry: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      role: "admin",
      defaultRoute: "/painel/admin",
      password: "admin@123",
    },
    {
      id: "4",
      name: "Demo User",
      email: "demo@sportstats.com",
      subscription: "active",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      role: "client",
      defaultRoute: "/dashboard",
      password: "demo123",
    },
  ]

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (error) {
          console.error("Error parsing stored user data:", error)
          localStorage.removeItem("user")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; redirectTo?: string }> => {
    setLoading(true)

    // Simulate API call - replace with actual authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const account = mockAccounts.find((mock) => mock.email === email && mock.password === password)

    if (account) {
      const { password: _password, ...userData } = account
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      setLoading(false)
      return { success: true, redirectTo: userData.defaultRoute }
    }

    setLoading(false)
    return { success: false, error: "Email ou senha incorretos" }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)

    // Simulate API call - replace with actual registration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock registration logic
    const userData: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      subscription: "active", // New users get active subscription
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      role: "client",
      defaultRoute: "/dashboard",
    }

    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    setLoading(false)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function requireAuth(user: User | null): boolean {
  return user !== null && user.subscription === "active"
}
