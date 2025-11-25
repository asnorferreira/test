
'use client';

import { FormEvent, useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../components/auth-provider';

export default function WidgetSnippetPage() {
  const { user } = useAuth();
  const [campaignId, setCampaignId] = useState('');
  const [snippet, setSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.tenantId) {
      setError('Tenant atual nao identificado.');
      return;
    }
    setSnippet(null);
    setError(null);
    setLoading(true);
    try {
      const response = await apiFetch<string>(
        `/snippet/embed?tenantId=${encodeURIComponent(
          user.tenantId,
        )}&campaignId=${encodeURIComponent(campaignId)}`,
        {
          headers: { Accept: 'text/plain' },
        },
      );
      setSnippet(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao gerar snippet.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Snippet do widget"
      description="Gere o script para embutir o Coach em paginas externas."
    >
      <form
        onSubmit={handleGenerate}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm md:flex-row md:items-end"
      >
        <div className="flex flex-1 flex-col gap-2">
          <label
            htmlFor="campaign-id"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            ID da campanha
          </label>
          <input
            id="campaign-id"
            required
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
            placeholder="UUID da campanha"
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-xs text-muted-foreground">
            Utilize o ID exato retornado pela API de campanhas.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Gerando...' : 'Gerar snippet'}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {snippet ? (
        <section className="mt-4 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <header className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-foreground">
              Script de incorporacao
            </h2>
            <p className="text-xs text-muted-foreground">
              Inclua o snippet abaixo perto do final do <code>&lt;body&gt;</code>. O atributo
              <code>data-api-url</code> aponta para o API Gateway utilizado pelo widget.
            </p>
          </header>

          <pre className="mt-4 overflow-auto rounded-xl border border-border bg-secondary/60 p-4 text-xs text-muted-foreground">
            <code>{snippet}</code>
          </pre>

          <div className="mt-4 rounded-xl border border-border bg-secondary/60 p-4 text-xs text-muted-foreground leading-relaxed">
            <p>
              Depois de embutir o script, chame{' '}
              <code>window.IntermediusCoach.joinConversation(conversationId)</code>{' '}
              quando a conversa for iniciada. Utilize{' '}
              <code>window.IntermediusCoach.reset()</code> para limpar a tela
              entre atendimentos.
            </p>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
