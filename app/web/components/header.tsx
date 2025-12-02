"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { GESTOR_SESSION_STORAGE_KEY, RH_SESSION_STORAGE_KEY } from "@/app/web/lib/constants"

const services = [
  {
    category: "Administrativo",
    items: ["Recepcionista", "Auxiliar Administrativo", "Porteiro", "Auxiliar de Escritório"],
  },
  {
    category: "Limpeza e Conservação",
    items: ["Faxineiro", "Zelador", "Varredor", "Coletor de lixo"],
  },
  {
    category: "Serviços Gerais",
    items: ["Auxiliar de serviços gerais", "Operador de Xerox", "Servente/Copeira", "Maqueiro"],
  },
  {
    category: "Arquitetura e Engenharia",
    items: ["Engenharia Civil", "Supervisão de Obras", "Projetos Executivos", "Coordenação Arquitetônica"],
  },
  {
    category: "Transporte e Logística",
    items: ["Motorista", "Carregador", "Conferente", "Arrumador"],
  },
]

type NavigationLinkItem = { label: string; href: string; openInNewTab?: boolean }
type NavigationDropdownItem = { label: string; type: "services" }
type NavigationItem = NavigationLinkItem | NavigationDropdownItem

const isNavigationLinkItem = (item: NavigationItem): item is NavigationLinkItem => "href" in item

const navigationItems: NavigationItem[] = [
  { label: "QUEM SOMOS", href: "/quem-somos" },
  { label: "NOSSOS SERVIÇOS", type: "services" },
  { label: "NOTÍCIAS", href: "/noticias" },
  // { label: "CLIENTES", href: "/clientes" },
  { label: "PROPOSTA DE TERCEIRIZAÇÃO", href: "/proposta-terceirizacao" },
  { label: "ENVIAR CURRÍCULO", href: "/curriculo", openInNewTab: true },
  { label: "CONTATO", href: "/contato" },
]

const careerRoutes = ["/curriculo", "/login", "/rh", "/cadastro", "/gestor"]

export function Header() {
  const pathname = usePathname()
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAtTop, setIsAtTop] = useState(true)
  const [isRhLoggedIn, setIsRhLoggedIn] = useState(false)
  const [isGestorLoggedIn, setIsGestorLoggedIn] = useState(false)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isCareerArea = careerRoutes.some((route) => pathname?.startsWith(route))

  const handleRhLogout = () => {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.removeItem(RH_SESSION_STORAGE_KEY)
    setIsRhLoggedIn(false)
  }

  const handleGestorLogout = () => {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.removeItem(GESTOR_SESSION_STORAGE_KEY)
    setIsGestorLoggedIn(false)
  }

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsServicesOpen(false)
    }, 300)
  }

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    setIsServicesOpen(true)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 80)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const syncRhSession = () => {
      if (typeof window === "undefined") {
        return
      }
      const storedRhSession = window.localStorage.getItem(RH_SESSION_STORAGE_KEY)
      const storedGestorSession = window.localStorage.getItem(GESTOR_SESSION_STORAGE_KEY)
      setIsRhLoggedIn(storedRhSession === "true")
      setIsGestorLoggedIn(storedGestorSession === "true")
    }

    syncRhSession()
    window.addEventListener("storage", syncRhSession)
    window.addEventListener("focus", syncRhSession)

    return () => {
      window.removeEventListener("storage", syncRhSession)
      window.removeEventListener("focus", syncRhSession)
    }
  }, [])

  const isHomepage = pathname === "/"
  const useGlassEffect = isHomepage && isAtTop

  const linkClasses = clsx(
    "text-xs font-semibold tracking-[0.2em] uppercase transition-colors",
    useGlassEffect ? "text-white hover:text-white/80" : "text-gray-700 hover:text-[#2563eb]",
  )

  const logoClasses = clsx(
    "font-bold transition-all duration-300",
    useGlassEffect ? "text-3xl text-white" : "text-2xl text-[#1e3a8a]",
  )

  const dropdownContainerClasses = clsx(
    "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[900px] rounded-2xl shadow-xl border backdrop-blur-2xl p-8 transition-colors duration-300",
    isAtTop ? "bg-white/12 border-white/30" : "bg-white border-white/70",
  )

  const dropdownHeadingClasses = clsx(
    "text-sm font-bold mb-4 transition-colors",
    isAtTop ? "text-white" : "text-[#2563eb]",
  )

  const dropdownCategoryClasses = clsx(
    "text-sm font-bold mb-3 transition-colors",
    isAtTop ? "text-white" : "text-[#1e3a8a]",
  )

  const dropdownLinkClasses = clsx(
    "text-sm transition-colors",
    isAtTop ? "text-white/80 hover:text-white" : "text-[#2563eb] hover:text-[#1e3a8a]",
  )

  const dropdownMoreButtonClasses = clsx(
    "text-sm transition-colors mt-2",
    isAtTop ? "text-white/70 hover:text-white" : "text-[#2563eb] hover:text-[#1e3a8a]",
  )

  const ctaLinkClasses = clsx(
    "text-sm font-medium hover:underline transition-colors",
    isAtTop ? "text-white" : "text-[#2563eb]",
  )

  const outlineButtonClasses = clsx(
    "hidden md:inline-flex items-center rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
    isAtTop ? "border-white/50 text-white hover:bg-white/10" : "border-[#2563eb] text-[#1e3a8a] hover:bg-[#dbeafe]",
  )

  const loginButtonClasses = clsx(
    "inline-flex items-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    isAtTop
      ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus-visible:outline-white/80"
      : "bg-[#1d4ed8] text-white hover:bg-[#1e3a8a] focus-visible:outline-[#93c5fd]",
  )

  const careerNavLinkClasses =
    "text-xs font-semibold uppercase tracking-[0.25em] text-[#1e1b4b] hover:text-[#2563eb] transition-colors"

  const careerLoginButtonClasses =
    "inline-flex items-center rounded-full bg-[#2563eb] px-6 py-2 text-xs	font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#1d4ed8]"

  const careerLogoutButtonClasses =
    "inline-flex items-center rounded-full bg-[#ef4444] px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#dc2626]"

  const baseCareerNavItems = [
    { label: "ENVIAR CURRÍCULO", href: "/curriculo" },
    { label: "QUEM SOMOS", href: "/quem-somos" },
    { label: "CONTATO", href: "/contato" },
  ]

  const careerNavItems = [
    ...baseCareerNavItems,
    ...(isRhLoggedIn ? [{ label: "ÁREA RH", href: "/rh" }] : []),
    ...(isGestorLoggedIn ? [{ label: "ÁREA GESTOR", href: "/gestor" }] : []),
  ]

  const shouldAddTopGradient = Boolean(pathname && pathname !== "/" && pathname !== "/servicos")

  if (isCareerArea) {
    return (
      <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl font-black tracking-tight text-[#1d4ed8]">JSP</span>
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#94a3b8]">Carreiras</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {careerNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  careerNavLinkClasses,
                  pathname === item.href ? "text-[#2563eb]" : "text-[#1f2937]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/curriculo"
              prefetch={false}
              className="hidden rounded-full border border-[#1d4ed8] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1d4ed8] transition hover:bg-[#eff6ff] md:inline-flex"
            >
              FORMULÁRIO
            </Link>
            {isRhLoggedIn || isGestorLoggedIn ? (
              <button
                type="button"
                onClick={isGestorLoggedIn ? handleGestorLogout : handleRhLogout}
                className={careerLogoutButtonClasses}
              >
                LOGOUT
              </button>
            ) : (
              <Link href="/login" className={careerLoginButtonClasses}>
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
        <div
            className={clsx(
              "flex items-center justify-between rounded-full px-8 py-4 border transition-all duration-300",
              useGlassEffect ? "bg-white/12 border-white/40 backdrop-blur-3xl shadow-lg" : "bg-white border-transparent shadow-lg",
            )}
        >
          <Link href="/" className="flex items-center">
            <span className={logoClasses}>JSP</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navigationItems.map((item) =>
              !isNavigationLinkItem(item) ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className={clsx("flex items-center gap-1", linkClasses)}>
                    {item.label}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isServicesOpen && (
                    <div className={dropdownContainerClasses}>
                      <div className="mb-6">
                        <h3 className={dropdownHeadingClasses}>NOSSOS SERVIÇOS</h3>
                      </div>

                      <div className="grid grid-cols-5 gap-8 mb-6">
                        {services.map((service) => (
                          <div key={service.category}>
                            <h4 className={dropdownCategoryClasses}>{service.category}</h4>
                            <ul className="space-y-2">
                              {service.items.map((item) => (
                                <li key={item}>
                                  <Link
                                    href={`/servicos/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                    className={dropdownLinkClasses}
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            {service.items.length > 4 && (
                              <button className={dropdownMoreButtonClasses}>
                                + {service.items.length - 4} mais
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t">
                        <Link href="/servicos" className={ctaLinkClasses}>
                          VER TODOS OS SERVIÇOS →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={linkClasses}
                  prefetch={item.openInNewTab ? false : undefined}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </Link>
              ),
            )}

            {isCareerArea && isRhLoggedIn && (
              <Link href="/rh" className={linkClasses}>
                ÁREA RH
              </Link>
            )}
            {isCareerArea && isGestorLoggedIn && (
              <Link href="/gestor" className={linkClasses}>
                ÁREA GESTOR
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={clsx(
                "transition-colors",
                useGlassEffect ? "text-[#60a5fa] hover:text-[#2563eb]" : "text-[#1e3a8a] hover:text-[#2563eb]",
              )}
            >
              {isSearchOpen ? (
                <X className={clsx("w-5 h-5", useGlassEffect ? "text-white" : "text-[#1e3a8a]")} />
              ) : (
                <Search className={clsx("w-5 h-5", useGlassEffect ? "text-white" : "text-[#1e3a8a]")} />
              )}
            </button>

            <button
              type="button"
              className={clsx(
                "inline-flex items-center rounded-full border p-3 transition hover:bg-opacity-90 md:hidden",
                useGlassEffect
                  ? "border-white/60 bg-white/10 text-white hover:bg-white/20"
                  : "border-[#1e3a8a] bg-[#1e3a8a] text-white hover:bg-[#2563eb]",
              )}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {isCareerArea && (
              <Link href="/login" className={loginButtonClasses}>
                LOGIN
              </Link>
            )}
          </div>
        </div>

        {isSearchOpen && (
          <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar serviços, páginas, informações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
                autoFocus
              />
            </div>

            {searchQuery && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-3">Resultados para "{searchQuery}"</p>
                <div className="space-y-2">
                  {services.flatMap((service) =>
                    service.items
                      .filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((item) => (
                        <Link
                          key={item}
                          href={`/servicos/${item.toLowerCase().replace(/\s+/g, "-")}`}
                          className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <p className="text-sm font-medium text-gray-900">{item}</p>
                          <p className="text-xs text-gray-500">{service.category}</p>
                        </Link>
                      )),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white/95 backdrop-blur-lg">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-[#1e3a8a]">
                JSP
              </Link>
              <button
                type="button"
                className="rounded-full bg-white/80 p-2 shadow"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5 text-[#1e3a8a]" />
              </button>
            </div>
          </div>
          <div className="px-6 py-8 space-y-6">
            <nav className="space-y-4">
              {navigationItems.map((item) =>
                isNavigationLinkItem(item) ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-lg font-semibold text-[#1e3a8a]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <details key={item.label} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="flex items-center justify-between text-lg font-semibold text-[#1e3a8a]">
                      {item.label}
                      <ChevronDown className="h-4 w-4 transition group-open:-rotate-180" />
                    </summary>
                    <div className="mt-4 space-y-3">
                      {services.map((service) => (
                        <div key={service.category}>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1e3a8a]">
                            {service.category}
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-gray-600">
                            {service.items.map((serviceName) => (
                              <li key={serviceName}>
                                <Link
                                  href={`/servicos/${serviceName.toLowerCase().replace(/\s+/g, "-")}`}
                                  className="hover:text-[#1e3a8a]"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {serviceName}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                ),
              )}
            </nav>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <Link href="/contato" className="block text-base font-semibold text-[#1e3a8a]">
                CONTATO
              </Link>
              <Link href="/curriculo" className="block text-base font-semibold text-[#1e3a8a]">
                ENVIAR CURRÍCULO
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

