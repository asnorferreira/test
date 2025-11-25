/* eslint-disable @next/next/no-img-element */
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Cable,
  Code,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "./auth-provider";

const navigationItems = [
  {
    label: "Visao geral",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Campanhas",
    href: "/campaigns",
    icon: Megaphone,
  },
  {
    label: "Conectores",
    href: "/connectors",
    icon: Cable,
  },
  {
    label: "Snippet do widget",
    href: "/configs",
    icon: Code,
  },
  {
    label: "Usuarios",
    href: "/users",
    icon: Users,
  },
  {
    label: "Qualidade",
    href: "/quality",
    icon: ShieldCheck,
  },
  {
    label: "Configuracoes",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [tenantName, setTenantName] = useState<string>('Carregando...');

  useEffect(() => {
    let mounted = true;
    apiFetch<{ name?: string }>('/tenant-settings')
      .then((settings) => {
        if (mounted) {
          setTenantName(settings?.name ?? 'Tenant atual');
        }
      })
      .catch(() => {
        if (mounted) {
          setTenantName('Tenant atual');
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="relative hidden w-64 shrink-0 border-r border-border bg-secondary/60 px-5 py-6 shadow-sm lg:flex">
      <div className="flex h-full flex-col gap-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              IC
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                Intermedius Coach
              </span>
              <span className="text-xs text-muted-foreground">Console</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tenant atual
            </span>
            <span className="text-sm font-medium text-foreground">
              {tenantName}
            </span>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Link
            href="/tenants"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/70"
          >
            Trocar tenant
          </Link>
        </div>
      </div>
    </aside>
  );
}
