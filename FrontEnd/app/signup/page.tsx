"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  })
  const [error, setError] = useState("")
  const { signup, loading } = useAuth()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.acceptTerms) {
      setError("Você deve aceitar os termos de uso")
      return
    }

    const result = await signup(formData.name, formData.email, formData.password)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Erro ao criar conta")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Benefits */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Junte-se ao Opta Plataform</h1>
              <p className="text-white text-lg">
                Acesse estatísticas completas e análises em tempo real das principais ligas esportivas.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Estatísticas em tempo real de 6 ligas principais",
                "Análise detalhada de probabilidades dos jogadores",
                "Visualização interativa do campo de jogo",
                "Relatórios e insights personalizados",
                "Suporte prioritário 24/7",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-white">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#0a101a] to-[#101a2b] border border-primary/20 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">R$ 29/mês</div>
                <div className="text-white">Acesso completo a todas as funcionalidades</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div>
          {/* Logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[#05070d]" />
              </div>
              <span className="text-2xl font-bold text-white">Opta Plataform</span>
            </Link>
          </div>

          <Card className="bg-[#0a101a] border-[#1f2935] backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Criar Conta</CardTitle>
              <CardDescription className="text-white">
                Comece sua jornada com estatísticas esportivas profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#141b27] border-[#2a3648] text-white placeholder:text-white/60 focus:border-primary"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      placeholder="Crie uma senha segura"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                    className="border-[#2a3648] data-[state=checked]:bg-primary"
                    disabled={loading}
                  />
                  <Label htmlFor="terms" className="text-sm text-white">
                    Aceito os{" "}
                    <Link href="/terms" className="text-primary hover:text-primary/80">
                      termos de uso
                    </Link>{" "}
                    e{" "}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">
                      política de privacidade
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={!formData.acceptTerms || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta - R$ 29/mês"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                    Faça login
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
    </div>
  )
}

