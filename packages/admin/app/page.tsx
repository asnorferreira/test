
'use client';

import { useMemo } from 'react';
import { AppShell } from '../components/app-shell';
import { useApi } from '../lib/use-api';
import { formatRelative, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BadgeAlert, Eye, MessageCircle } from 'lucide-react';

type DashboardMetrics = {
  totalConversations: number;
  averageScore: number | null;
  averageAdherence: number | null;
};

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

export default function DashboardPage() {
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => subDays(endDate, 7), [endDate]);

  const dashboardQuery = `/reports/dashboard?startDate=${encodeURIComponent(
    startDate.toISOString(),
  )}&endDate=${encodeURIComponent(endDate.toISOString())}`;
  const snapshotsQuery = `/reports/quality?page=1&pageSize=5`;

  const {
    data: metrics,
    loading: loadingMetrics,
    error: metricsError,
  } = useApi<DashboardMetrics>(dashboardQuery);

  const {
    data: snapshotData,
    loading: loadingSnapshots,
    error: snapshotsError,
  } = useApi<SnapshotResponse>(snapshotsQuery);

  const totalAlerts =
    snapshotData?.items.filter((item) => Boolean(item.payload.alert)).length ??
    0;

  return (
    <AppShell
      title="Visao geral da operacao"
      description="Resumo dos indicadores chave para acompanhar campanhas, equipe e qualidade."
      actions={null}
    >
      {metricsError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {metricsError}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Conversas analisadas"
          helper="Ultimos 7 dias"
          loading={loadingMetrics}
          value={metrics?.totalConversations ?? 0}
        />
        <KpiCard
          title="Score medio"
          helper="Resultado das analises"
          loading={loadingMetrics}
          value={
            typeof metrics?.averageScore === 'number'
              ? `${metrics.averageScore.toFixed(1)}%`
              : '---'
          }
        />
        <KpiCard
          title="Aderencia media"
          helper="Checklist cumprido"
          loading={loadingMetrics}
          value={
            typeof metrics?.averageAdherence === 'number'
              ? `${metrics.averageAdherence.toFixed(1)}%`
              : '---'
          }
        />
        <KpiCard
          title="Alertas da IA"
          helper="Pendentes de revisao"
          loading={loadingSnapshots}
          value={totalAlerts}
          icon={<BadgeAlert className="h-4 w-4 text-rose-500" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Conversas com acompanhamento
              </h2>
              <p className="text-xs text-muted-foreground">
                Sugestoes geradas pela IA Coach nas ultimas analises.
              </p>
            </div>
          </header>

          {snapshotsError ? (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {snapshotsError}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {loadingSnapshots ? (
              <PlaceholderCard message="Carregando conversas..." />
            ) : null}
            {!loadingSnapshots && (snapshotData?.items?.length ?? 0) === 0 ? (
              <PlaceholderCard message="Nenhuma conversa analisada recentemente." />
            ) : null}

            {snapshotData?.items.map((snapshot) => (
              <article
                key={snapshot.id}
                className="rounded-xl border border-border bg-secondary/60 p-4 text-sm text-foreground"
              >
                <header className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      Conversa {snapshot.conversation.externalId}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Campanha: {snapshot.conversation.campaignId}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(new Date(snapshot.createdAt), new Date(), {
                      locale: ptBR,
                    })}
                  </span>
                </header>

                {snapshot.payload.alert ? (
                  <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {snapshot.payload.alert}
                  </p>
                ) : null}

                {snapshot.payload.suggestions &&
                snapshot.payload.suggestions.length ? (
                  <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                    {snapshot.payload.suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={`${snapshot.id}-suggestion-${index}`}>
                        - {suggestion.content}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <button className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                  <Eye className="h-3 w-3" />
                  Ver detalhes
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-secondary/60 p-6 shadow-sm">
          <header className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-foreground">
                Resumo do periodo
              </h2>
              <span className="text-xs text-muted-foreground">
                {formatRelative(startDate, new Date(), { locale: ptBR })} ate agora
              </span>
            </div>
          </header>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Utilize a aba &quot;Qualidade&quot; para revisar rapidamente as
            conversas sinalizadas. Ative a IA por campanha para receber as
            sugestoes em tempo real no widget.
          </p>
        </div>
      </section>
    </AppShell>
  );
}

type KpiCardProps = {
  title: string;
  helper: string;
  value: number | string;
  loading?: boolean;
  icon?: React.ReactNode;
};

function KpiCard({ title, helper, value, loading, icon }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary text-secondary-foreground p-5 shadow-card">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        {icon}
      </div>
      <span className="text-3xl font-semibold text-foreground">
        {loading ? '...' : value}
      </span>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function PlaceholderCard({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground">
      {message}
    </div>
  );
}
