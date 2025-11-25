'use client';

import { Bell, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

export function AppTopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ThemeIcon = mounted
    ? isDark
      ? Sun
      : Moon
    : Moon;

  const iconAriaLabel = mounted
    ? isDark
      ? "Mudar para tema claro"
      : "Mudar para tema escuro"
    : "Alternar tema";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/90 px-6 backdrop-blur">
      <div className="hidden items-center gap-3 md:flex">
        <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
          Tenant: HealthPrime
        </div>
        <Link
          href="/tenants"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Selecionar outro
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search className="h-4 w-4" aria-hidden="true" />
          <input
            className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            placeholder="Buscar campanhas, usuarios..."
          />
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
          aria-label={iconAriaLabel}
          disabled={!mounted}
        >
          <ThemeIcon className="h-4 w-4" />
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user?.displayName?.[0]?.toUpperCase() ??
              user?.email?.[0]?.toUpperCase() ??
              'U'}
          </div>
          <div className="hidden flex-col text-xs leading-tight sm:flex">
            <span className="font-semibold text-foreground">
              {user?.displayName ?? user?.email ?? 'Usuario'}
            </span>
            <span className="text-muted-foreground">
              {user?.role ?? 'Perfil'}
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="hidden rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground transition hover:bg-secondary/60 sm:inline-flex"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
