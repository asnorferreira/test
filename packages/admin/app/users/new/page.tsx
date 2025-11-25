
'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AppShell } from '../../../components/app-shell';
import { useAuth } from '../../../components/auth-provider';
import { apiFetch } from '../../../lib/api';

const roles = [
  { value: 'ATENDENTE', label: 'Atendente' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'QA', label: 'QA' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function NewUserPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ATENDENTE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.tenantId) {
      setError('Tenant atual nao identificado.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: {
          email,
          password,
          displayName: displayName || undefined,
          role,
          tenantId: user.tenantId,
        },
      });
      setSuccess('Usuario criado com sucesso.');
      setDisplayName('');
      setEmail('');
      setPassword('');
      setRole('ATENDENTE');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nao foi possivel criar o usuario.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Novo usuario"
      description="Cadastre um membro da equipe, defina papel e selecione as campanhas com acesso."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/users"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <button
            type="submit"
            form="new-user-form"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Salvar usuario
          </button>
        </div>
      }
    >
      <form
        id="new-user-form"
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm md:grid-cols-2"
      >
        {error ? (
          <div className="md:col-span-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="md:col-span-2 rounded-xl border border-emerald-300/40 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nome completo
          </label>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Ex. Camila Duarte"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email corporativo
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="pessoa@empresa.com"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Senha inicial
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground">
            O usuario podera alterar a senha apos o primeiro acesso.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Papel
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          >
            {roles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Administradores conseguem alterar configuracoes globais; supervisores
            acompanham campanhas e equipe.
          </p>
        </div>
      </form>
    </AppShell>
  );
}
