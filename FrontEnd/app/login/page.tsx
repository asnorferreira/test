"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Eye, EyeOff, LinkIcon, Loader2, ShieldCheck, UserRound } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

const demoAccounts = [
  {
    label: "Conta cliente",
    email: "cliente.demo@opta.com",
    password: "usuario@123",
    icon: UserRound,
  },
  {
    label: "Conta afiliado",
    email: "afiliado.demo@opta.com",
    password: "afiliado@123",
    icon: LinkIcon,
  },
  {
    label: "Conta admin",
    email: "admin.demo@opta.com",
    password: "admin@123",
    icon: ShieldCheck,
  },
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await login(email, password)

    if (result.success) {
      router.push(result.redirectTo ?? "/dashboard")
    } else {
      setError(result.error || "Erro ao fazer login")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#05070d]" />
            </div>
            <span className="text-2xl font-bold text-white">Opta Plataform</span>
          </Link>
        </div>

        <Card className="bg-[#0a101a] border-[#1f2935] backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-white">
              Entre na sua conta para acessar as estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-500/50 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="mb-4 border-primary/40 bg-primary/10">
              <AlertDescription className="space-y-2">
                {demoAccounts.map(({ label, email, password, icon: Icon }) => (
                  <div key={email} className="flex items-start gap-3 text-primary">
                    <Icon className="mt-0.5 h-4 w-4" />
                    <div className="text-sm">
                      <p className="font-semibold">{label}</p>
                      <p className="text-primary/80">Email: {email}</p>
                      <p className="text-primary/80">Senha: {password}</p>
                    </div>
                  </div>
                ))}
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#141b27] border-[#2a3648] text-white placeholder:text-white/60 focus:border-primary"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#141b27] border-[#2a3648] text-white placeholder:text-white/60 focus:border-primary pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white">
                Não tem uma conta?{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-white hover:text-primary text-sm">
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}

