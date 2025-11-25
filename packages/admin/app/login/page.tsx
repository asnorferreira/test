'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { login, token, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('healthprime');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && token) {
      router.replace('/');
    }
  }, [loading, token, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password, tenantSlug });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Nao foi possivel realizar o login.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-gradient-to-br from-primary/10 via-primary/20 to-primary/40 p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3 text-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            IC
          </div>
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-wide">
              Intermedius Coach
            </span>
            <span className="text-lg font-semibold">
              Painel do administrador
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-primary">
            Operacao sob controle em um unico painel.
          </h1>
          <p className="text-lg text-primary/80">
            Configure campanhas, acompanhe performance da equipe e garanta
            compliance do atendimento em tempo real.
          </p>
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-5 text-primary">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Destaques da plataforma
            </span>
            <ul className="space-y-2 text-sm">
              <li>- Monitoramento ao vivo das conversas.</li>
              <li>- Playbooks com sugestao de proxima acao.</li>
              <li>- Auditoria automatica com flags de risco.</li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-primary/70">
          Copyright (c) {new Date().getFullYear()} Intermedius Coach
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-md space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Acessar o console
            </h2>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais corporativas.
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="voce@empresa.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="********"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tenant
              </label>
              <input
                required
                value={tenantSlug}
                onChange={(event) => setTenantSlug(event.target.value)}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Slug do tenant (ex: healthprime)"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-border" />
                Lembrar acesso
              </label>
              <Link
                href="/reset-password"
                className="font-semibold text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="rounded-2xl border border-border bg-secondary/60 p-5 text-xs text-muted-foreground">
            <strong>Multi-tenant habilitado.</strong> Depois de logar escolha o
            tenant desejado ou continue com o padrao.
          </div>
        </div>
      </section>
    </main>
  );
}
