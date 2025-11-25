'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppShell } from '../../components/app-shell.js';
import { useApi } from '../../lib/use-api.js';

type Snapshot = {
  id: string;
  createdAt: string;
  payload: {
    alert?: string | null;
    suggestions?: { content: string; type: string }[];
    checklist?: { name: string; status: string; reason?: string }[];
  };
  conversation: {
    externalId: string;
    campaignId: string;
    startedAt: string | null;
  };
};

type SnapshotResponse = {
  totalItems: number;
  items: Snapshot[];
};

export default function QualityPage() {
  const { data, error, loading } = useApi<SnapshotResponse>(
    '/reports/quality?page=1&pageSize=15',
  );
  const snapshots = data?.items ?? [];

  const summary = useMemo(() => {
    const total = snapshots.length;
    const alerts = snapshots.filter((item) => Boolean(item.payload.alert)).length;
    return { total, alerts };
  }, [snapshots]);

  return (
    <AppShell
      title="Qualidade e auditoria"
      description="Monitore aderencia ao script, flags de risco e priorize conversas para revisao."
    >
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-muted-foreground">
              {summary.total} conversas auditadas recentemente
            </span>
            <span>Alertas severos: {summary.alerts}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Conversa</th>
                <th className="px-4 py-3 text-left font-semibold">Campanha</th>
                <th className="px-4 py-3 text-left font-semibold">Alertas</th>
                <th className="px-4 py-3 text-left font-semibold">Sugestoes</th>
                <th className="px-4 py-3 text-left font-semibold">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    Carregando auditoria...
                  </td>
                </tr>
              ) : null}

              {!loading && snapshots.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    Nenhum snapshot encontrado.
                  </td>
                </tr>
              ) : null}

              {snapshots.map((snapshot) => {
                const suggestions = snapshot.payload.suggestions ?? [];
                return (
                  <tr key={snapshot.id} className="bg-background">
                    <td className="px-4 py-4 font-medium">
                      {snapshot.conversation.externalId}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {snapshot.conversation.campaignId}
                    </td>
                    <td className="px-4 py-4">
                      {snapshot.payload.alert ? (
                        <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase text-rose-700">
                          Alerta
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase text-emerald-700">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {suggestions
                        .slice(0, 2)
                        .map((item) => item.content)
                        .join(' | ') || '-'}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {format(new Date(snapshot.createdAt), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
