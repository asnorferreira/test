
'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { AppShell } from '../../../components/app-shell';
import { apiFetch } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function NewConnectorPage() {
  const router = useRouter();
  const [provider, setProvider] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiFetch('/connectors', {
        method: 'POST',
        body: { provider, name, token },
      });
      setSuccess('Conector criado com sucesso.');
      setProvider('');
      setName('');
      setToken('');
      router.push('/connectors');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nao foi possivel criar o conector.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Novo conector"
      description="Cadastre uma credencial para integrar um provedor externo."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/connectors"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <button
            type="submit"
            form="new-connector-form"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Salvar conector
          </button>
        </div>
      }
    >
      <form
        id="new-connector-form"
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
            Provedor
          </label>
          <input
            required
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="Ex: openai, helena, whatsapp"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground">
            Utilize um identificador curto. O backend utiliza este campo para validar a credencial.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nome interno
          </label>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Whatsapp Principal, OpenAI Prod..."
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Token / chave secreta
          </label>
          <textarea
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Cole aqui a chave do provedor"
            className="min-h-[120px] rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground">
            Os tokens sao criptografados e armazenados com seguranca no backend.
            A validacao e executada automaticamente apos o cadastro.
          </p>
        </div>
      </form>
    </AppShell>
  );
}




