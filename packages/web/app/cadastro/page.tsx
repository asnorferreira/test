"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CheckCircle2, LogIn, UserPlus } from "lucide-react"

type Step = 1 | 2

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [document, setDocument] = useState("")
  const [phone, setPhone] = useState("")

  const handleNext = () => {
    if (!fullName || !email || !confirmEmail) {
      setFeedback("Preencha nome e e-mail para continuar.")
      return
    }

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setFeedback("Os e-mails não conferem.")
      return
    }

    setFeedback(null)
    setStep(2)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 6) {
      setFeedback("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setFeedback("As senhas não conferem.")
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    setTimeout(() => {
      setIsSubmitting(false)
      setFeedback("Cadastro criado com sucesso! Direcionando para o login.")
      setFullName("")
      setEmail("")
      setConfirmEmail("")
      setPassword("")
      setConfirmPassword("")
      setDocument("")
      setPhone("")
      setStep(1)
      setTimeout(() => router.push("/login"), 1200)
    }, 1000)
  }

  return (
    <main className="bg-[#f8fafc] pb-20 pt-32">
      <div className="mx-auto max-w-3xl px-4">
        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Portal JSP</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cadastro de acesso</h1>
              <p className="text-sm text-gray-500">
                Crie seu login para acompanhar vagas, enviar currículos e liberar o painel do RH.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-[#2563eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb] hover:bg-[#eff6ff]"
            >
              <LogIn className="h-4 w-4" />
              login
            </Link>
          </div>

          <div className="mt-6 flex justify-between text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            <span className={step === 1 ? "text-[#2563eb]" : ""}>1. Dados básicos</span>
            <span className={step === 2 ? "text-[#2563eb]" : ""}>2. Segurança</span>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  Nome completo
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="Seu nome"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  E-mail corporativo
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="seuemail@jsp.com"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Confirmar e-mail
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(event) => setConfirmEmail(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="repita seu e-mail"
                  />
                </label>
                <div className="flex flex-wrap justify-between gap-4">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Documento (CPF ou CNPJ)
                    <input
                      type="text"
                      value={document}
                      onChange={(event) => setDocument(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      placeholder="000.000.000-00"
                    />
                  </label>
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    Telefone
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      placeholder="(00) 00000-0000"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#2563eb] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#1d4ed8]"
                >
                  continuar
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  Senha
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="••••••••"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Confirmar senha
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="••••••••"
                  />
                </label>
                <ul className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    Use letras, números e um caractere especial.
                  </li>
                  <li className="mt-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    A senha precisa de pelo menos 6 caracteres.
                  </li>
                </ul>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-full border border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 hover:bg-gray-50"
                  >
                    voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-full bg-[#2563eb] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#1d4ed8] disabled:opacity-60"
                  >
                    {isSubmitting ? "CRIANDO..." : "criar acesso"}
                  </button>
                </div>
              </div>
            )}
          </form>

          {feedback && (
            <p className="mt-4 rounded-2xl bg-[#eff6ff] px-4 py-3 text-xs font-semibold text-[#1e3a8a]" aria-live="polite">
              {feedback}
            </p>
          )}
        </section>

        <div className="mt-6 rounded-3xl border border-dashed border-[#cbd5f5] bg-[#eef2ff] p-6 text-sm text-[#312e81] shadow-inner">
          <div className="flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-[#4338ca]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#4338ca]">Vantagens do cadastro</p>
              <p className="text-xs text-[#4c1d95]">
                Receba alertas personalizados, salve currículos e libere o acesso na área do RH com um único login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
