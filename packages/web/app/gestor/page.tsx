"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Building,
  Download,
  FileImage,
  FileText,
  Layers,
  ListChecks,
  MonitorSmartphone,
  Paintbrush,
  Plus,
  Save,
  Settings,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react"
import { GESTOR_SESSION_STORAGE_KEY } from "@/packages/web/lib/constants"

type Client = {
  id: string
  name: string
  segment: string
  description: string
  coverImage: string
  tags: string[]
}
type RhUser = { id: string; name: string; email: string; status: "ativo" | "pendente" }
type Candidate = { id: string; name: string; area: string; status: string; updatedAt: string }
type Slide = {
  id: string
  title: string
  subtitle: string
  image: string
  ctaLabel: string
  ctaLink: string
}

const defaultClients: Client[] = [
  {
    id: "cli-1",
    name: "Prefeitura do Recife",
    segment: "Setor Público",
    description: "Parceria estratégica para serviços administrativos, limpeza urbana e apoio logístico em órgãos municipais.",
    coverImage: "https://placehold.co/800x400?text=Prefeitura",
    tags: ["Administrativo", "Limpeza", "Serviços Gerais"],
  },
  {
    id: "cli-2",
    name: "Rede Office",
    segment: "Corporate",
    description: "Serviços de facilities completos para torres corporativas e escritórios de alto padrão.",
    coverImage: "https://placehold.co/800x400?text=Corporate",
    tags: ["Portaria", "Manutenção", "Facilities"],
  },
]

const defaultRhUsers: RhUser[] = [
  { id: "rh-1", name: "Camila Duarte", email: "camila.duarte@jsp.com", status: "ativo" },
  { id: "rh-2", name: "Roberto Fernandes", email: "roberto.fernandes@jsp.com", status: "pendente" },
]

const defaultCandidates: Candidate[] = [
  { id: "JSP-2301", name: "Marina Costa", area: "Administrativo", status: "Novo", updatedAt: "18/04/2024" },
  { id: "JSP-2292", name: "Carlos Brito", area: "Facilities", status: "Em análise", updatedAt: "17/04/2024" },
  { id: "JSP-2287", name: "Juliana Souza", area: "Arquitetura e Engenharia", status: "Entrevista", updatedAt: "16/04/2024" },
]

const defaultSlides: Slide[] = [
  {
    id: "slide-1",
    title: "Excelência em Facilities",
    subtitle: "Padronize a mensagem principal exibida no topo da home.",
    image: "https://placehold.co/1200x600/0f172a/fff?text=Slide+1",
    ctaLabel: "Solicitar proposta",
    ctaLink: "/proposta-terceirizacao",
  },
  {
    id: "slide-2",
    title: "Profissionais treinados",
    subtitle: "Use este espaço para destacar certificações, indicadores ou cases.",
    image: "https://placehold.co/1200x600/1d4ed8/fff?text=Slide+2",
    ctaLabel: "Ver serviços",
    ctaLink: "/servicos",
  },
]

export default function GestorPage() {
  const [hasSession, setHasSession] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "slides" | "clients" | "rh" | "curriculos">("overview")

  const [slides, setSlides] = useState<Slide[]>(defaultSlides)
  const [selectedSlideId, setSelectedSlideId] = useState(defaultSlides[0].id)
  const [slideFeedback, setSlideFeedback] = useState<string | null>(null)

  const emptyClientForm = {
    name: "",
    segment: "",
    description: "",
    coverImage: "",
    tags: "",
  }
  const [clients, setClients] = useState<Client[]>(defaultClients)
  const [newClient, setNewClient] = useState(emptyClientForm)

  const [rhUsers, setRhUsers] = useState<RhUser[]>(defaultRhUsers)
  const [newRhUser, setNewRhUser] = useState({ name: "", email: "" })
  const [isRhModalOpen, setIsRhModalOpen] = useState(false)
  const [candidates, setCandidates] = useState(defaultCandidates)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const isLogged = window.localStorage.getItem(GESTOR_SESSION_STORAGE_KEY) === "true"
    setHasSession(isLogged)
  }, [])

const stats = useMemo(
    () => [
      { label: "Clientes ativos", value: clients.length, icon: Building },
      { label: "Usuários de RH", value: rhUsers.length, icon: Users },
      { label: "Currículos no mês", value: "68", icon: FileText },
      { label: "Slides publicados", value: slides.length, icon: FileImage },
    ],
    [clients.length, rhUsers.length, slides.length],
  )

  const selectedSlide = slides.find((slide) => slide.id === selectedSlideId) ?? slides[0]
  const candidateStatusOptions = ["Novo", "Em análise", "Entrevista", "Contratado"]

  const handleSlideUpdate = (field: keyof Slide, value: string) => {
    setSlides((prev) => prev.map((slide) => (slide.id === selectedSlideId ? { ...slide, [field]: value } : slide)))
  }

  const handleSlideImageUpload = (file: File | null) => {
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        handleSlideUpdate("image", reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSlideSave = () => {
    setSlideFeedback("Slide atualizado com sucesso! O carrossel principal já reflete as alterações.")
    setTimeout(() => setSlideFeedback(null), 2000)
  }

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: "Novo destaque",
      subtitle: "Adicione o copy do novo banner aqui.",
      image: "https://placehold.co/1200x600/0284c7/fff?text=Novo+Slide",
      ctaLabel: "Saiba mais",
      ctaLink: "/",
    }
    setSlides((prev) => [...prev, newSlide])
    setSelectedSlideId(newSlide.id)
  }

  const handleRemoveSlide = (id: string) => {
    const filtered = slides.filter((slide) => slide.id !== id)
    setSlides(filtered)
    if (filtered.length > 0 && id === selectedSlideId) {
      setSelectedSlideId(filtered[0].id)
    }
  }

  const handleAddClient = () => {
    if (!newClient.name || !newClient.segment || !newClient.description) {
      return
    }
    setClients((prev) => [
      ...prev,
      {
        id: `cli-${Date.now()}`,
        name: newClient.name,
        segment: newClient.segment,
        description: newClient.description,
        coverImage: newClient.coverImage || "https://placehold.co/800x400?text=Novo+Cliente",
        tags: newClient.tags
          ? newClient.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : ["Serviço personalizado"],
      },
    ])
    setNewClient(emptyClientForm)
  }

  const handleRemoveClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id))
  }

  const handleToggleRhStatus = (id: string) => {
    setRhUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: user.status === "ativo" ? "pendente" : "ativo" } : user,
      ),
    )
  }

  const handleAddRhUser = () => {
    if (!newRhUser.name.trim() || !newRhUser.email.trim()) {
      return
    }
    setRhUsers((prev) => [
      ...prev,
      { id: `rh-${Date.now()}`, name: newRhUser.name.trim(), email: newRhUser.email.trim().toLowerCase(), status: "pendente" },
    ])
    setNewRhUser({ name: "", email: "" })
    setIsRhModalOpen(false)
  }

  const handleRemoveRhUser = (id: string) => {
    setRhUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const handleCloseRhModal = () => {
    setIsRhModalOpen(false)
    setNewRhUser({ name: "", email: "" })
  }

  const handleCandidateStatusChange = (id: string, status: string) => {
    setCandidates((prev) => prev.map((candidate) => (candidate.id === id ? { ...candidate, status } : candidate)))
  }

  if (!hasSession) {
    return (
      <main className="bg-[#eef2ff] pb-24 pt-36">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
            <Settings className="mx-auto h-16 w-16 text-[#2563eb]" />
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Área restrita ao gestor</h1>
            <p className="mt-3 text-sm text-gray-500">
              Faça login com o perfil de gestão para editar conteúdos, aprovar usuários de RH e acompanhar os indicadores
              gerais.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-[#2563eb] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg hover:bg-[#1d4ed8]"
              >
                acessar login
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-[#f5f7ff] pb-32 pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6366f1]">Painel do Gestor</p>
            <h1 className="text-3xl font-bold text-gray-900">Configurações gerais do site</h1>
            <p className="text-sm text-gray-500">
              Organize slides, clientes, usuários de RH e acompanhe os indicadores principais.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#4f46e5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#4f46e5] hover:bg-[#eef2ff]"
          >
            <Layers className="h-4 w-4" />
            ver site
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-3xl bg-white p-5 shadow">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-[#eef2ff] p-3 text-[#4f46e5]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        <nav className="mt-8 flex flex-wrap gap-3">
          {[
            { id: "overview", label: "Visão geral" },
            { id: "slides", label: "Slides do site" },
            { id: "clients", label: "Clientes" },
            { id: "rh", label: "Equipe RH" },
            { id: "curriculos", label: "Currículos" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                activeTab === tab.id ? "bg-[#2563eb] text-white" : "bg-white text-gray-600 shadow"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "overview" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-3xl bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Operações</p>
                  <h2 className="text-xl font-bold text-gray-900">Resumo do dia</h2>
                </div>
                <BarChart3 className="h-10 w-10 text-[#2563eb]" />
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-[#2563eb]" />
                  12 novos currículos aguardando triagem.
                </li>
                <li className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#2563eb]" />
                  2 clientes aguardam atualização de logo.
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#2563eb]" />
                  3 usuários de RH aguardam aprovação.
                </li>
              </ul>
              <button className="mt-6 w-full rounded-full border border-[#2563eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb] hover:bg-[#eef2ff]">
                baixar relatório completo
              </button>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Atalhos rápidos</p>
              <div className="mt-5 grid gap-4 text-sm text-gray-600">
                {[
                  { label: "Atualizar slides do site", desc: "Texto e CTA do carrossel principal" },
                  { label: "Publicar novo cliente", desc: "Logo, segmento e card da página clientes" },
                  { label: "Revisar usuários RH", desc: "Aprovar ou bloquear acessos corporativos" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "slides" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[0.35fr_1fr]">
            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Slides publicados</p>
              <ul className="mt-4 space-y-3">
                {slides.map((slide) => (
                  <li
                    key={slide.id}
                    className={`rounded-2xl border p-4 text-sm transition ${
                      slide.id === selectedSlideId ? "border-[#2563eb] bg-[#eef2ff]" : "border-gray-100 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex w-full flex-col text-left"
                      onClick={() => setSelectedSlideId(slide.id)}
                    >
                      <span className="font-semibold text-gray-900">{slide.title}</span>
                      <span className="text-xs text-gray-500">{slide.subtitle.slice(0, 60)}...</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlide(slide.id)}
                      className="mt-3 text-xs font-semibold text-[#ef4444]"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleAddSlide}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-dashed border-[#2563eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]"
              >
                <Plus className="mr-2 h-4 w-4" />
                adicionar slide
              </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Editor do slide</p>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSlide?.title}</h2>
                </div>
                <MonitorSmartphone className="h-10 w-10 text-[#2563eb]" />
              </div>

              {selectedSlide && (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">
                    Título
                    <input
                      type="text"
                      value={selectedSlide.title}
                      onChange={(event) => handleSlideUpdate("title", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Subtítulo
                    <textarea
                      value={selectedSlide.subtitle}
                      onChange={(event) => handleSlideUpdate("subtitle", event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                      Rótulo do CTA
                      <input
                        type="text"
                        value={selectedSlide.ctaLabel}
                        onChange={(event) => handleSlideUpdate("ctaLabel", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Link do CTA
                      <input
                        type="text"
                        value={selectedSlide.ctaLink}
                        onChange={(event) => handleSlideUpdate("ctaLink", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                      />
                    </label>
                  </div>
                  <label className="text-sm font-medium text-gray-700">
                    URL da imagem
                    <input
                      type="url"
                      value={selectedSlide.image}
                      onChange={(event) => handleSlideUpdate("image", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#2563eb] focus:bg-white"
                    />
                  </label>
                  <div className="rounded-2xl border border-dashed border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Upload do hero</p>
                        <p className="text-xs text-gray-500">Tamanho ideal: 1600 × 800 px (JPG ou PNG, até 2 MB).</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">
                        substitui o banner principal
                      </span>
                    </div>
                    <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-5 text-center text-sm text-gray-500 transition hover:border-[#2563eb] hover:text-[#1d4ed8]">
                      <UploadCloud className="h-6 w-6" />
                      <div>
                        <p className="font-semibold text-gray-900">Selecionar imagem</p>
                        <p className="text-xs text-gray-500">Arraste e solte ou clique para escolher um arquivo.</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => handleSlideImageUpload(event.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Pré-visualização</p>
                    <img
                      src={selectedSlide.image}
                      alt="Pré-visualização do slide"
                      className="mt-2 h-48 w-full rounded-2xl object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSlideSave}
                    className="inline-flex items-center rounded-full bg-[#2563eb] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#1d4ed8]"
                  >
                    <Paintbrush className="mr-2 h-4 w-4" />
                    salvar slide
                  </button>
                  {slideFeedback && (
                    <p className="text-xs font-semibold text-[#16a34a]" aria-live="polite">
                      {slideFeedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "clients" && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Clientes em destaque</p>
                <h2 className="text-xl font-bold text-gray-900">Controle da página /clientes</h2>
              </div>
              <button className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                <Download className="mr-2 h-4 w-4" />
                exportar
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {clients.map((client) => (
                <article key={client.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{client.segment}</p>
                          <h3 className="text-2xl font-semibold text-gray-900">{client.name}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveClient(client.id)}
                          className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-[#ef4444] hover:text-[#ef4444]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">{client.description}</p>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Serviços</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {client.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-3 text-xs text-gray-500 sm:grid-cols-2">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                          <p className="text-sm font-semibold text-gray-900">Segmento</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{client.segment}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                          <p className="text-sm font-semibold text-gray-900">Visibilidade</p>
                          <p>Case publicado na página /clientes</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:max-w-sm">
                      <img src={client.coverImage} alt={client.name} className="h-48 w-full rounded-2xl object-cover" />
                      <p className="mt-3 text-xs text-gray-500">Prévia da imagem exibida no grid principal.</p>
                      <button className="mt-4 w-full rounded-full border border-[#1e3a8a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1e3a8a] transition hover:bg-[#eef2ff]">
                        ver case completo →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-dashed border-gray-200 p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Adicionar novo cliente</p>
                  <p className="text-sm text-gray-500">Inclua cases completos com descrição e serviços oferecidos.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Campos obrigatórios</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Nome do cliente
                  <input
                    type="text"
                    placeholder="Ex: Prefeitura do Recife"
                    value={newClient.name}
                    onChange={(event) => setNewClient((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Segmento
                  <input
                    type="text"
                    placeholder="Corporate, Setor Público..."
                    value={newClient.segment}
                    onChange={(event) => setNewClient((prev) => ({ ...prev, segment: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700 md:col-span-2">
                  Descrição
                  <textarea
                    placeholder="Conte como esse cliente utiliza os serviços da JSP."
                    value={newClient.description}
                    onChange={(event) => setNewClient((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
                    rows={3}
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  URL da imagem de capa
                  <input
                    type="url"
                    placeholder="https://exemplo.com/capa.jpg"
                    value={newClient.coverImage}
                    onChange={(event) => setNewClient((prev) => ({ ...prev, coverImage: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Tags
                  <input
                    type="text"
                    placeholder="Separadas por vírgula (Portaria, Facilities)"
                    value={newClient.tags}
                    onChange={(event) => setNewClient((prev) => ({ ...prev, tags: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-gray-500">Dica: utilize imagens 1200 × 600 px para manter o padrão visual.</p>
                <button
                  type="button"
                  onClick={handleAddClient}
                  className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:bg-[#1d4ed8]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  adicionar cliente
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "rh" && (
          <>
            <section className="mt-8 rounded-3xl bg-white p-6 shadow">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Equipe do RH</p>
                  <h2 className="text-xl font-bold text-gray-900">Gerencie acessos corporativos</h2>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-[#2563eb]" />
                  <button
                    type="button"
                    onClick={() => setIsRhModalOpen(true)}
                    className="inline-flex items-center rounded-full border border-dashed border-[#2563eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb] transition hover:bg-[#eef2ff]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    adicionar usuário
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {rhUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleRhStatus(user.id)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${
                        user.status === "ativo" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fef3c7] text-[#b45309]"
                      }`}
                    >
                      {user.status === "ativo" ? "ATIVO" : "PENDENTE"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRhUser(user.id)}
                      className="text-xs font-semibold text-[#ef4444]"
                    >
                      remover
                    </button>
                  </div>
                ))}
              </div>
            </section>
            {isRhModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Novo usuário RH</p>
                      <h3 className="text-lg font-bold text-gray-900">Cadastrar colaborador</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseRhModal}
                      className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 hover:text-gray-600"
                    >
                      fechar
                    </button>
                  </div>
                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault()
                      handleAddRhUser()
                    }}
                  >
                    <label className="text-sm font-medium text-gray-700">
                      Nome completo
                      <input
                        type="text"
                        value={newRhUser.name}
                        onChange={(event) => setNewRhUser((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Ex: Camila Duarte"
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
                        required
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      E-mail corporativo
                      <input
                        type="email"
                        value={newRhUser.email}
                        onChange={(event) => setNewRhUser((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="nome.sobrenome@jsp.com"
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
                        required
                      />
                    </label>
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={handleCloseRhModal}
                        className="rounded-full border border-gray-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 transition hover:text-gray-700 sm:min-w-[130px]"
                      >
                        cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow transition hover:bg-[#1d4ed8] sm:min-w-[150px]"
                      >
                        salvar usuário
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "curriculos" && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Currículos recentes</p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Panorama geral</h2>
            <ul className="mt-4 space-y-3">
              {candidates.map((candidate) => (
                <li key={candidate.id} className="rounded-2xl border border-gray-100 p-3">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span className="font-semibold">{candidate.name}</span>
                    <span className="text-xs text-gray-400">{candidate.updatedAt}</span>
                  </div>
                  <p className="text-xs text-gray-500">{candidate.area}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={candidate.status}
                      onChange={(event) => handleCandidateStatusChange(candidate.id, event.target.value)}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#4f46e5]"
                    >
                      {candidateStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-gray-500">
                      Alterações ficam visíveis para o time de RH e para o candidato.
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
