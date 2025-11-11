"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LockKeyhole, LogIn, UserRound } from "lucide-react"
import { GESTOR_SESSION_STORAGE_KEY, RH_SESSION_STORAGE_KEY } from "@/lib/constants"

type AccessType = "candidate" | "rh" | "gestor"

export default function LoginPage() {
  const router = useRouter()
  const [accessType, setAccessType] = useState<AccessType>("candidate")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isRhAuthenticated, setIsRhAuthenticated] = useState(false)
  const [isGestorAuthenticated, setIsGestorAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    setIsRhAuthenticated(window.localStorage.getItem(RH_SESSION_STORAGE_KEY) === "true")
    setIsGestorAuthenticated(window.localStorage.getItem(GESTOR_SESSION_STORAGE_KEY) === "true")
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)

      if (accessType === "rh") {
        window.localStorage.setItem(RH_SESSION_STORAGE_KEY, "true")
        setIsRhAuthenticated(true)
        setFeedback("Login confirmado! Acesse o painel para visualizar os currículos enviados.")
        router.push("/rh")
        return
      }

      if (accessType === "gestor") {
        window.localStorage.setItem(GESTOR_SESSION_STORAGE_KEY, "true")
        setIsGestorAuthenticated(true)
        setFeedback("Login do gestor confirmado! Acesse a área administrativa.")
        router.push("/gestor")
        return
      }

      setFeedback("Tudo pronto! Você pode continuar o cadastro do currículo.")
      router.push("/curriculo")
    }, 800)
  }

  const handleRhLogout = () => {
    window.localStorage.removeItem(RH_SESSION_STORAGE_KEY)
    setIsRhAuthenticated(false)
    setFeedback("Sessão do RH encerrada. Faça login novamente quando precisar acessar os currículos.")
  }

  const handleGestorLogout = () => {
    window.localStorage.removeItem(GESTOR_SESSION_STORAGE_KEY)
    setIsGestorAuthenticated(false)
    setFeedback("Sessão do gestor encerrada. Faça login novamente para editar o site.")
  }

  const selectorClasses = (type: AccessType) =>
    `flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition ${
      accessType === type
        ? "border-[#2563eb] bg-[#1d4ed8] text-white"
        : "border-gray-200 bg-white text-gray-500 hover:border-[#93c5fd]"
    }`

  return (
    <main className="bg-[#f8fafc] pb-16 pt-32">
      <div className="mx-auto max-w-3xl px-4">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Portal JSP</p>
              <h1 className="text-3xl font-bold text-gray-900">Login para candidatos e RH</h1>
              <p className="text-sm text-gray-500">
                O mesmo login libera o envio do currículo e o acesso à aba exclusiva do RH. Escolha abaixo como deseja
                entrar.
              </p>
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setAccessType("candidate")} className={selectorClasses("candidate")}>
                Sou candidato
              </button>
              <button type="button" onClick={() => setAccessType("rh")} className={selectorClasses("rh")}>
                Sou RH
              </button>
              <button type="button" onClick={() => setAccessType("gestor")} className={selectorClasses("gestor")}>
                Sou gestor
              </button>
              <Link
                href="/cadastro"
                className="flex-1 rounded-2xl border border-dashed border-[#2563eb] px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-[#2563eb] transition hover:bg-[#eff6ff]"
              >
                cadastre-se
              </Link>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="text-sm font-medium text-gray-700">
                E-mail
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  placeholder="seuemail@email.com"
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Senha
                <input
                  type="password"
                  name="password"
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  placeholder="••••••••"
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Documento (CPF ou CNPJ)
                <input
                  type="text"
                  name="document"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  placeholder="000.000.000-00"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <label className="inline-flex items-center gap-2 text-gray-600">
                  <input type="checkbox" name="remember" className="h-4 w-4 rounded border-gray-300 text-[#2563eb]" />
                  manter conectado
                </label>
                <Link href="/curriculo" className="font-semibold uppercase tracking-[0.3em] text-[#2563eb]">
                  esqueci meus dados
                </Link>
              </div>

              {feedback && (
                <div className="rounded-2xl bg-[#eff6ff] px-4 py-3 text-xs font-semibold text-[#1e3a8a]" aria-live="polite">
                  {feedback}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#1d4ed8] disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "ENTRANDO..." : "ENTRAR"}
              </button>
            </form>

            {isRhAuthenticated && (
              <div className="mt-6 rounded-2xl border border-[#2563eb] bg-[#eff6ff] p-4 text-sm text-[#1d4ed8]">
                <p className="font-semibold">Sessão do RH ativa</p>
                <p className="text-xs text-[#1e3a8a]">
                  A navegação já mostra a aba &quot;Área RH&quot;. Clique abaixo para encerrar o acesso compartilhado.
                </p>
                <div className="mt-3 flex gap-3">
                  <Link
                    href="/rh"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-[#1d4ed8]"
                  >
                    <UserRound className="h-4 w-4" />
                    abrir painel
                  </Link>
                  <button
                    type="button"
                    onClick={handleRhLogout}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-[#2563eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1d4ed8]"
                  >
                    sair
                  </button>
                </div>
              </div>
            )}

            {isGestorAuthenticated && (
              <div className="mt-4 rounded-2xl border border-[#1d4ed8] bg-[#e0e7ff] p-4 text-sm text-[#312e81]">
                <p className="font-semibold">Sessão do gestor ativa</p>
                <p className="text-xs text-[#312e81]">
                  A área &quot;Gestor&quot; já está liberada no menu. Acesse para editar banners, clientes e visualizar relatórios.
                </p>
                <div className="mt-3 flex gap-3">
                  <Link
                    href="/gestor"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1d4ed8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-[#1e3a8a]"
                  >
                    <UserRound className="h-4 w-4" />
                    painel gestor
                  </Link>
                  <button
                    type="button"
                    onClick={handleGestorLogout}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-[#1d4ed8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1e3a8a]"
                  >
                    sair
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] p-6 text-white shadow-2xl">
            <LockKeyhole className="h-10 w-10" />
            <h2 className="mt-4 text-2xl font-semibold">Segurança e transparência</h2>
            <p className="mt-2 text-sm text-white/80">
              Toda movimentação no portal fica registrada e apenas usuários autenticados conseguem visualizar os
              currículos armazenados.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/70">
              <li>✓ Confirmação em duas etapas para o RH</li>
              <li>✓ Expiração automática de sessão inativa</li>
              <li>✓ Logs disponíveis para auditoria</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
