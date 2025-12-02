"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Download, Eye, LockKeyhole, Search, ShieldCheck, Users } from "lucide-react"
import { RH_SESSION_STORAGE_KEY } from "@/app/web/lib/constants"

type CandidateStatus = "Novo" | "Em análise" | "Entrevista" | "Contratado"

const defaultCandidates = [
  {
    id: "JSP-2301",
    name: "Marina Costa",
    area: "Administrativo",
    contract: "CLT",
    status: "Novo" as CandidateStatus,
    updatedAt: "18/04/2024",
    availability: "Imediata",
    resumeUrl: "/docs/curriculos/jsp-2301.pdf",
    formUrl: "/rh/formularios/jsp-2301",
  },
  {
    id: "JSP-2292",
    name: "Carlos Brito",
    area: "Facilities",
    contract: "Temporário",
    status: "Em análise" as CandidateStatus,
    updatedAt: "17/04/2024",
    availability: "15 dias",
    resumeUrl: "/docs/curriculos/jsp-2292.pdf",
    formUrl: "/rh/formularios/jsp-2292",
  },
  {
    id: "JSP-2287",
    name: "Juliana Souza",
    area: "Arquitetura e Engenharia",
    contract: "CLT",
    status: "Entrevista" as CandidateStatus,
    updatedAt: "16/04/2024",
    availability: "30 dias",
    resumeUrl: "/docs/curriculos/jsp-2287.pdf",
    formUrl: "/rh/formularios/jsp-2287",
  },
  {
    id: "JSP-2281",
    name: "Roberto Lima",
    area: "Logística",
    contract: "CLT",
    status: "Contratado" as CandidateStatus,
    updatedAt: "12/04/2024",
    availability: "Imediata",
    resumeUrl: "/docs/curriculos/jsp-2281.pdf",
    formUrl: "/rh/formularios/jsp-2281",
  },
]

const statusOptions: Array<CandidateStatus | "Todos"> = ["Todos", "Novo", "Em análise", "Entrevista", "Contratado"]
const candidateStatusOptions: CandidateStatus[] = ["Novo", "Em análise", "Entrevista", "Contratado"]
const mockRhUser = {
  email: "rh@jsp.com",
  password: "jsp@2024",
  name: "Ana Ribeiro",
  squad: "Coordenação Nacional",
}

export default function RhDashboardPage() {
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("Todos")
  const [query, setQuery] = useState("")
  const [hasSession, setHasSession] = useState(false)
  const [candidateRows, setCandidateRows] = useState(defaultCandidates)
  const [loginEmail, setLoginEmail] = useState(mockRhUser.email)
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    setHasSession(window.localStorage.getItem(RH_SESSION_STORAGE_KEY) === "true")
  }, [])

  const handleRhLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError(null)
    setIsLoggingIn(true)

    setTimeout(() => {
      if (loginEmail === mockRhUser.email && loginPassword === mockRhUser.password) {
        window.localStorage.setItem(RH_SESSION_STORAGE_KEY, "true")
        setHasSession(true)
        setLoginPassword("")
      } else {
        setLoginError("Credenciais inválidas. Utilize o acesso de demonstração informado ao lado.")
      }
      setIsLoggingIn(false)
    }, 600)
  }

  const filteredCandidates = useMemo(() => {
    return candidateRows.filter((candidate) => {
      const matchesStatus = status === "Todos" || candidate.status === status
      const matchesQuery =
        !query ||
        candidate.name.toLowerCase().includes(query.toLowerCase()) ||
        candidate.area.toLowerCase().includes(query.toLowerCase()) ||
        candidate.id.toLowerCase().includes(query.toLowerCase())
      return matchesStatus && matchesQuery
    })
  }, [candidateRows, query, status])

  const handleCandidateStatusChange = (id: string, nextStatus: CandidateStatus) => {
    setCandidateRows((prev) => prev.map((candidate) => (candidate.id === id ? { ...candidate, status: nextStatus } : candidate)))
  }

  if (!hasSession) {
    return (
      <main className="bg-[#eef2ff] pb-20 pt-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl bg-white p-10 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6366f1]">Painel exclusivo</p>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Login corporativo do RH</h1>
              <p className="mt-3 text-sm text-gray-500">
                Utilize o acesso fornecido pela coordenação da JSP para acompanhar currículos, movimentar candidatos e
                exportar relatórios em tempo real.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#22c55e]" />
                  Somente usuários autenticados visualizam documentos enviados.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#22c55e]" />
                  Alertas automáticos sempre que um currículo novo chega.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#22c55e]" />
                  Logs completos para auditorias da equipe corporativa.
                </li>
              </ul>

              <div className="mt-8 rounded-2xl border border-dashed border-[#c7d2fe] bg-[#eef2ff] p-5 text-sm text-[#312e81]">
                <p className="font-semibold uppercase tracking-[0.25em] text-[#4338ca]">Acesso de demonstração</p>
                <p className="mt-2 text-xs text-[#4338ca]/70">Use as credenciais abaixo para testar o painel:</p>
                <dl className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">E-mail</dt>
                    <dd className="text-sm font-semibold text-[#1e3a8a]">{mockRhUser.email}</dd>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2">
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Senha</dt>
                    <dd className="text-sm font-semibold text-[#1e3a8a]">{mockRhUser.password}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-[#312e81]">
                  Perfil: {mockRhUser.name} — {mockRhUser.squad}
                </p>
              </div>
            </div>

            <form onSubmit={handleRhLogin} className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2ff]">
                  <LockKeyhole className="h-6 w-6 text-[#4338ca]" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#94a3b8]">Acesso RH</p>
                  <h2 className="text-xl font-bold text-gray-900">Entrar no painel</h2>
                </div>
              </div>

              <label className="text-sm font-medium text-gray-700">
                E-mail
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#4f46e5] focus:bg-white"
                  required
                />
              </label>

              <label className="mt-4 text-sm font-medium text-gray-700">
                Senha
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#4f46e5] focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </label>

              {loginError && (
                <p className="mt-4 rounded-2xl bg-[#fee2e2] px-4 py-3 text-xs font-semibold text-[#b91c1c]">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#4338ca] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#312e81] disabled:opacity-60"
              >
                {isLoggingIn ? "Validando..." : "Acessar painel"}
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                Após autenticar, o menu superior libera a aba <span className="font-semibold text-[#4f46e5]">“Área RH”</span>.
              </p>

              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
                Precisa de ajuda? Entre em contato com <Link href="mailto:suporte@jsp.com" className="font-semibold text-[#4338ca]">suporte@jsp.com</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#f1f5f9] pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-center md:justify-between md:text-left">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Painel RH</p>
            <h1 className="text-3xl font-bold text-gray-900">Currículos cadastrados</h1>
            <p className="text-sm text-gray-500">Filtre por área, contrato ou situação para agilizar a triagem.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center rounded-full bg-[#2563eb] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg hover:bg-[#1d4ed8]">
              <Download className="mr-2 h-4 w-4" />
              exportar lista
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Candidatos ativos", value: "128" },
            { label: "Triagens pendentes", value: "32" },
            { label: "Contratados em abril", value: "14" },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">{card.label}</p>
              <p className="mt-3 text-3xl font-bold text-[#1e3a8a]">{card.value}</p>
              <p className="text-xs text-gray-500">Atualizado agora</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, ID ou área"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-full border border-gray-200 px-12 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                    status === option ? "bg-[#2563eb] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm text-gray-600">
              <thead>
                <tr className="text-xs uppercase tracking-[0.3em] text-gray-400">
                  <th className="pb-4">ID</th>
                  <th className="pb-4">Nome</th>
                  <th className="pb-4">Área</th>
                  <th className="pb-4">Contrato</th>
                  <th className="pb-4">Disponibilidade</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Atualizado</th>
                  <th className="pb-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-t border-gray-100">
                    <td className="py-4 font-semibold text-gray-900">{candidate.id}</td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-900">{candidate.name}</p>
                      <p className="text-xs text-gray-400">currículo em PDF</p>
                    </td>
                    <td className="py-4">{candidate.area}</td>
                    <td className="py-4">{candidate.contract}</td>
                    <td className="py-4">{candidate.availability}</td>
                    <td className="py-4">
                      <select
                        value={candidate.status}
                        onChange={(event) =>
                          handleCandidateStatusChange(candidate.id, event.target.value as CandidateStatus)
                        }
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1d4ed8]"
                      >
                        {candidateStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 text-right text-xs text-gray-400">{candidate.updatedAt}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={candidate.formUrl}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#4f46e5] hover:text-[#4f46e5]"
                          title={`Ver formulário de ${candidate.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <a
                          href={candidate.resumeUrl}
                          download
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#4f46e5]/10 text-[#4f46e5] transition hover:bg-[#4f46e5] hover:text-white"
                          title={`Baixar currículo de ${candidate.name}`}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCandidates.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-500">Nenhum currículo encontrado com os filtros atuais.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
