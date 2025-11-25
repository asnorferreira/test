import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";
import { AppShell } from "../../components/app-shell.js";

const tenants = [
  {
    id: "healthprime",
    name: "HealthPrime",
    segment: "Saude B2B",
    users: 42,
    campaigns: 12,
    status: "Ativo",
    current: true,
  },
  {
    id: "fitbox",
    name: "FitBox Studios",
    segment: "Fitness B2C",
    users: 18,
    campaigns: 6,
    status: "Em rollout",
    current: false,
  },
  {
    id: "educonnect",
    name: "EduConnect",
    segment: "Educacao",
    users: 25,
    campaigns: 8,
    status: "Ativo",
    current: false,
  },
];

export default function TenantsPage() {
  return (
    <AppShell
      title="Selecionar tenant"
      description="Escolha qual tenant deseja administrar. Apenas um tenant pode estar ativo por sessao."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className={`flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm ${
              tenant.current ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-foreground">
                    {tenant.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tenant.segment}
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                {tenant.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-secondary/60 p-4 text-xs text-muted-foreground">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase">Usuarios</span>
                <span className="text-sm font-semibold text-foreground">
                  {tenant.users}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase">Campanhas</span>
                <span className="text-sm font-semibold text-foreground">
                  {tenant.campaigns}
                </span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between">
              <Link
                href={`/tenants/${tenant.id}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ver detalhes
              </Link>
              <button
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${
                  tenant.current
                    ? "bg-secondary text-foreground"
                    : "bg-primary text-primary-foreground shadow hover:opacity-90"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {tenant.current ? "Ativo" : "Ativar tenant"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
