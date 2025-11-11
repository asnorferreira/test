"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useState } from "react"
import { CheckCircle2, ClipboardList, FileText, Lock, ShieldCheck, Upload, Users } from "lucide-react"

const jobAreas = ["Administrativo", "Operacional", "Facilities", "Saúde", "Logística"]
const contractTypes = ["CLT", "Temporário", "Jovem Aprendiz", "Estágio", "Pessoa com deficiência"]
const workModes = ["Presencial", "Híbrido", "Remoto"]
const availabilityOptions = ["Imediata", "15 dias", "30 dias"]

const stepHighlights = [
  {
    step: "01",
    title: "Login validado",
    copy: "Garantimos o acesso correto antes de liberar a triagem.",
  },
  {
    step: "02",
    title: "Perfil completo",
    copy: "Conte quem você é e onde podemos falar com você.",
  },
  {
    step: "03",
    title: "Preferências",
    copy: "Informe a vaga, contrato e disponibilidade.",
  },
  {
    step: "04",
    title: "Envio seguro",
    copy: "Anexamos seu currículo e avisamos o RH.",
  },
]

type FeedbackState = {
  type: "success" | "error"
  message: string
} | null

type StepCardProps = {
  step: number
  title: string
  description: string
  children: ReactNode
  locked?: boolean
  lockedMessage?: string
}

function StepCard({ step, title, description, children, locked, lockedMessage }: StepCardProps) {
  return (
    <div className="relative rounded-3xl border border-[#e2e8f0] bg-white/80 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dbeafe] text-sm font-black text-[#1d4ed8]">
          {String(step).padStart(2, "0")}
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#94a3b8]">Passo {step}</p>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className={`space-y-4 ${locked ? "pointer-events-none blur-[1px] opacity-60" : ""}`}>{children}</div>

      {locked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/80 text-center text-xs font-semibold text-gray-500 backdrop-blur">
          <Lock className="mb-2 h-6 w-6 text-[#2563eb]" />
          {lockedMessage ?? "Conclua o passo anterior para liberar este conteúdo."}
        </div>
      )}
    </div>
  )
}

export default function ResumePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isAccessValidated, setIsAccessValidated] = useState(false)
  const [accessValidationMessage, setAccessValidationMessage] = useState<string | null>(null)
  const [isValidatingAccess, setIsValidatingAccess] = useState(false)

  const registeredEmails = ["rh@jsp.com", "talento@jsp.com", "contato@jsp.com"]

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setFeedback(null)

    if (!isAccessValidated) {
      setFeedback({
        type: "error",
        message: "Valide o acesso no passo 1 antes de continuar.",
      })
      return
    }

    if (!selectedFile) {
      setFeedback({
        type: "error",
        message: "Inclua o arquivo do currículo (PDF ou DOC) antes de finalizar.",
      })
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setFeedback({
        type: "success",
        message: "Recebemos os seus dados. Nossa equipe de seleção retornará em até 3 dias úteis.",
      })
      event.currentTarget.reset()
      setSelectedFile(null)
      setLoginEmail("")
      setLoginPassword("")
      setIsAccessValidated(false)
      setAccessValidationMessage(null)
    }, 1200)
  }

  const handleValidateAccess = () => {
    setAccessValidationMessage(null)

    if (!loginEmail || !loginPassword) {
      setAccessValidationMessage("Informe e-mail e senha para validar o acesso.")
      return
    }

    setIsValidatingAccess(true)
    setTimeout(() => {
      const exists = registeredEmails.includes(loginEmail.trim().toLowerCase())
      if (exists) {
        setIsAccessValidated(true)
        setAccessValidationMessage("Acesso confirmado! Continue o preenchimento.")
      } else {
        setIsAccessValidated(false)
        setAccessValidationMessage("Não encontramos esse login. Revise os dados ou cadastre-se.")
      }
      setIsValidatingAccess(false)
    }, 600)
  }

  const supportCards = [
    {
      title: "Quem somos",
      description: "Conheça a JSP e saiba como conectamos profissionais às oportunidades certas.",
      icon: Users,
      link: { label: "Saiba mais", href: "/quem-somos" },
    },
    {
      title: "Acompanhe seu processo",
      description: "Utilize o login para consultar status e receber alertas sobre novas vagas.",
      icon: ClipboardList,
      link: { label: "Ir para o login", href: "/login" },
    },
    {
      title: "Segurança dos dados",
      description: "Seguimos as diretrizes da LGPD e disponibilizamos acesso exclusivo ao RH.",
      icon: ShieldCheck,
    },
  ]

  return (
    <main className="bg-[#f1f5f9] pb-24 pt-40">
      <div className="mx-auto max-w-5xl px-4">
        <section className="mb-10 rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#38bdf8] p-10 text-center text-white shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Carreiras JSP</p>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">Envie seu currículo com clareza e rapidez</h1>
          <p className="mt-3 text-base text-white/80">
            Use o mesmo login do portal para compartilhar seus dados com o RH. Cada etapa abaixo explica exatamente o
            que precisamos para direcionar a vaga ideal para o seu perfil.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/30"
            >
              acessar login
            </Link>
            <Link
              href="/quem-somos"
              className="inline-flex items-center rounded-full border border-white/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
            >
              conhecer a jsp
            </Link>
          </div>
        </section>

        <ol className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stepHighlights.map((item) => (
            <li key={item.title} className="rounded-3xl border border-[#e2e8f0] bg-white/70 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#94a3b8]">Passo {item.step}</span>
              <p className="mt-2 text-xl font-semibold text-[#1e3a8a]">{item.title}</p>
              <p className="mt-1 text-sm text-gray-500">{item.copy}</p>
            </li>
          ))}
        </ol>

        <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-[#e2e8f0] bg-white/95 p-8 shadow-2xl backdrop-blur">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Formulário orientado</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">Siga cada etapa para enviar o currículo</h2>
            <p className="mt-2 text-sm text-gray-500">
              Organize os dados por passos. Você pode revisar tudo antes de concluir e anexar seu arquivo no final.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <StepCard
              step={1}
              title="Valide seu acesso"
              description="Utilize o login usado no portal JSP para liberar o envio seguro."
            >
              <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                E-mail corporativo
                <input
                  type="email"
                  name="loginEmail"
                  value={loginEmail}
                  onChange={(event) => {
                    setLoginEmail(event.target.value)
                    setIsAccessValidated(false)
                    setAccessValidationMessage(null)
                  }}
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb]"
                  placeholder="seuemail@jsp.com"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Senha
                <input
                  type="password"
                  name="loginPassword"
                  value={loginPassword}
                  onChange={(event) => {
                    setLoginPassword(event.target.value)
                    setIsAccessValidated(false)
                    setAccessValidationMessage(null)
                  }}
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb]"
                  placeholder="••••••••"
                />
              </label>
            </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleValidateAccess}
                  disabled={isValidatingAccess}
                  className="inline-flex items-center rounded-full bg-[#2563eb] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:bg-[#1d4ed8] disabled:opacity-60"
                >
                  {isValidatingAccess ? "Validando acesso..." : "Validar acesso"}
                </button>
                {accessValidationMessage && (
                  <p className={`text-xs font-semibold ${isAccessValidated ? "text-[#16a34a]" : "text-[#b91c1c]"}`}>
                    {accessValidationMessage}
                  </p>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Não tem login?{" "}
                <Link href="/cadastro" className="font-semibold text-[#2563eb] underline">
                  Cadastre-se para continuar
                </Link>
              </p>
            </StepCard>

            <StepCard
              step={2}
              title="Dados pessoais"
              description="Conte rapidamente quem você é e onde podemos falar com você."
              locked={!isAccessValidated}
              lockedMessage="Valide o acesso no passo 1 para liberar seus dados pessoais."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Nome completo
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="Seu nome"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Telefone
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="(00) 00000-0000"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Cidade
                  <input
                    type="text"
                    name="city"
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="Recife - PE"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  LinkedIn (opcional)
                  <input
                    type="url"
                    name="linkedin"
                    className="mt-2 w-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    placeholder="https://www.linkedin.com/in/"
                  />
                </label>
              </div>
            </StepCard>

            <StepCard
              step={3}
              title="Preferências da vaga"
              description="Escolha a área, contrato e disponibilidade para direcionarmos seu perfil."
            locked={!isAccessValidated}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Área desejada
                  <select
                    name="jobArea"
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  >
                    <option value="">Selecione</option>
                    {jobAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Tipo de contrato
                  <select
                    name="contractType"
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  >
                    <option value="">Selecione</option>
                    {contractTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Modalidade
                  <select
                    name="workMode"
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  >
                    <option value="">Selecione</option>
                    {workModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Disponibilidade
                  <select
                    name="availability"
                    required
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  >
                    <option value="">Selecione</option>
                    {availabilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="text-sm font-medium text-gray-700">
                Conte um pouco sobre a vaga desejada
                <textarea
                  name="message"
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                  placeholder="Descreva experiências, certificações e expectativas para esta oportunidade."
                />
              </label>
            </StepCard>

            <StepCard
              step={4}
              title="Envie o currículo"
              description="Anexe um arquivo atualizado para liberar para a equipe de RH."
            locked={!isAccessValidated}
            >
              <div className="rounded-3xl border-2 border-dashed border-[#93c5fd] bg-[#eff6ff] p-6 text-center">
                <Upload className="mx-auto mb-3 h-8 w-8 text-[#2563eb]" />
                <p className="text-sm font-semibold text-gray-900">Arraste o arquivo ou selecione abaixo</p>
                <p className="text-xs text-gray-500">Formatos aceitos: PDF, DOC ou DOCX (máx. 5 MB).</p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <input
                    id="resumeFile"
                    type="file"
                    name="resumeFile"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  />
                  <label
                    htmlFor="resumeFile"
                    className="inline-flex cursor-pointer items-center rounded-full bg-[#2563eb] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#1d4ed8]"
                  >
                    selecionar arquivo
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1d4ed8] underline"
                    >
                      remover
                    </button>
                  )}
                </div>
                {selectedFile && (
                  <p className="mt-3 text-xs text-gray-600">
                    <span className="font-semibold text-gray-900">Arquivo:</span> {selectedFile.name}
                  </p>
                )}
              </div>
            </StepCard>

            <StepCard
              step={5}
              title="Revisão e envio"
              description="Confirme que as informações estão corretas antes de enviar para o RH."
            locked={!isAccessValidated}
            >
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22c55e]" />
                  Revise os passos anteriores usando o botão voltar do navegador, se necessário.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22c55e]" />
                  Garantimos que apenas o RH autenticado terá acesso ao documento enviado.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22c55e]" />
                  Você receberá um e-mail automático confirmando o recebimento.
                </li>
              </ul>
            </StepCard>

            {feedback && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  feedback.type === "success" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"
                }`}
                aria-live="polite"
              >
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2563eb] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "ENVIANDO..." : "ENVIAR CURRÍCULO"}
            </button>
          </form>
        </section>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {supportCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-3xl bg-white p-6 text-center shadow-lg">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff]">
                  <Icon className="h-6 w-6 text-[#2563eb]" />
                </span>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#2563eb]">{card.title}</p>
                <p className="mt-2 text-xs text-gray-500">{card.description}</p>
                {card.link && (
                  <Link
                    href={card.link.href}
                    className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb] hover:underline"
                  >
                    {card.link.label}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
