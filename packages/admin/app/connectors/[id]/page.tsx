
'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PlugZap, RefreshCw, Trash2 } from 'lucide-react';
import { AppShell } from '../../../components/app-shell';
import { useApi } from '../../../lib/use-api';
import { apiFetch } from '../../../lib/api';

type Connector = {
  id: string;
  provider: string;
  name: string;
};

export default function ConnectorDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const connectorId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { data, error, loading, refetch } = useApi<Connector[]>('/connectors');
  const [testing, setTesting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const connector = useMemo(() => {
    return data?.find((item) => item.id === connectorId) ?? null;
  }, [data, connectorId]);

  const handleRetest = async () => {
    setTesting(true);
    try {
      // Reutiliza o fetch de listagem como teste basico.
      await refetch();
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = async () => {
    if (!connector) return;
    setRemoving(true);
    try {
      await apiFetch(`/connectors/${connector.id}`, { method: 'DELETE' });
      router.replace('/connectors');
    } catch (err) {
      console.error('Erro ao remover conector', err);
      setRemoving(false);
    }
  };

  return (
    <AppShell
      title={connector ? connector.name : 'Conector'}
      description="Gerencie credenciais e testes de integracao com provedores externos."
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
            onClick={handleRetest}
            disabled={testing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Retestando...' : 'Testar conexao'}
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {removing ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      }
    >
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-border bg-background p-6 text-sm text-muted-foreground">
          Carregando detalhes do conector...
        </div>
      ) : null}

      {!loading && !connector ? (
        <div className="rounded-2xl border border-border bg-background p-6 text-sm text-muted-foreground">
          Conector nao encontrado. Verifique se o identificador esta correto.
        </div>
      ) : null}

      {connector ? (
        <section className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <header className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <PlugZap className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                {connector.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Provedor: {connector.provider}
              </p>
              <p className="text-xs text-muted-foreground">
                ID interno: <code>{connector.id}</code>
              </p>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-secondary/60 p-4 text-sm text-foreground">
              <h3 className="font-semibold">Validacao automatica</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Toda credencial e validada pelo backend no momento do cadastro.
                Utilize o botao &quot;Testar conexao&quot; para reler as
                informacoes mais recentes do provedor.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/60 p-4 text-sm text-foreground">
              <h3 className="font-semibold">Boas praticas</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                <li>Rotacione as chaves periodicamente.</li>
                <li>
                  Configuracoes sensiveis ficam armazenadas com criptografia.
                </li>
                <li>Remova credenciais nao utilizadas.</li>
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}



