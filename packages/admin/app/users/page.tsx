
'use client';

import Link from 'next/link';
import { Plus, Shield } from 'lucide-react';
import { AppShell } from '../../components/app-shell';
import { useApi } from '../../lib/use-api';

type UserItem = {
  id: string;
  email: string;
  displayName?: string | null;
  role: string;
  status: string;
};

export default function UsersPage() {
  const { data, error, loading } = useApi<UserItem[]>('/users');
  const users = data ?? [];

  return (
    <AppShell
      title="Equipe"
      description="Controle quem pode acessar o console, qual papel possui e em quais campanhas cada usuario atua."
      actions={
        <Link
          href="/users/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Novo usuario
        </Link>
      }
    >
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Usuarios ativos"
            value={users.length}
            helper="Incluindo administradores"
          />
          <SummaryCard
            title="Perfis administrativos"
            value={users.filter((user) => user.role === 'ADMIN').length}
            helper="Admins com acesso total"
            icon={<Shield className="h-5 w-5 text-primary" />}
          />
          <SummaryCard
            title="Status aguardando"
            value={users.filter((user) => user.status !== 'ACTIVE').length}
            helper="Usuarios pendentes de aprovacao"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Papel</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    Carregando usuarios...
                  </td>
                </tr>
              ) : null}

              {!loading && users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    Nenhum usuario cadastrado.
                  </td>
                </tr>
              ) : null}

              {users.map((member) => (
                <tr key={member.id} className="bg-background">
                  <td className="px-4 py-4 font-medium">
                    {member.displayName ?? 'Sem nome'}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {member.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: number;
  helper: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/60 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
          {icon ?? value}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {title}
          </span>
          <span className="text-xs text-muted-foreground">{helper}</span>
        </div>
      </div>
      <span className="mt-4 block text-2xl font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}
