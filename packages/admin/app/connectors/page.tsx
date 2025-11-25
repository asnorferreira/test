'use client';

import Link from 'next/link';
import { PlusCircle, PlugZap, ShieldCheck, Trash2 } from 'lucide-react';
import { AppShell } from '../../components/app-shell';
import { useApi } from '../../lib/use-api';
import { apiFetch } from '../../lib/api';
import { useState } from 'react';

type Connector = {
  id: string;
  provider: string;
  name: string;
};

export default function ConnectorsPage() {
  const { data, error, loading, refetch } = useApi<Connector[]>('/connectors');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const connectors = data ?? [];

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await apiFetch(`/connectors/${id}`, {
        method: 'DELETE',
      });
      await refetch();
    } catch (err) {
      console.error('Failed to remove connector', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <AppShell
      title="Conectores"
      description="Integre provedores de comunicacao, CRMs e IA. Teste e monitore o status de cada conector."
      actions={
        <Link
          href="/connectors/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          Novo conector
        </Link>
      }
    >
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading && connectors.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-border bg-background p-6 text-sm text-muted-foreground">
            Carregando conectores...
          </div>
        ) : null}

        {!loading && connectors.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-border bg-background p-6 text-sm text-muted-foreground">
            Nenhum conector cadastrado. Utilize o botao &quot;Novo conector&quot;
            para registrar uma credencial.
          </div>
        ) : null}

        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {connector.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Provedor: {connector.provider}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: <code>{connector.id}</code>
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                Ativo
              </span>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
              <Link
                href={`/connectors/${connector.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <PlugZap className="h-4 w-4" />
                Detalhes
              </Link>
              <button
                onClick={() => handleRemove(connector.id)}
                disabled={removingId === connector.id}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removingId === connector.id ? (
                  <span>Removendo...</span>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Como validar um conector?
            </h3>
            <p className="text-xs text-muted-foreground">
              Ao registrar um conector o backend testa a chave automaticamente.
              Voce pode reprocessar a validacao abrindo os detalhes e utilizando
              a acao &quot;Testar conexao&quot;.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

