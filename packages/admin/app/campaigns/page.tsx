'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { apiFetch } from '../../lib/api';

type Campaign = {
  id: string;
  name: string;
  channel: string | null;
  status: string;
  aiEnabled: boolean;
  aiProvider: string | null;
  aiModel: string | null;
  createdAt?: string;
};

type CampaignDraft = {
  aiEnabled: boolean;
  aiProvider: string;
  aiModel: string;
};

const AI_PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (via N8N)' },
  { value: 'google', label: 'Google Gemini' },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CampaignDraft>>({});
  const [loading, setLoading] = useState(true);
  const [savingCampaignId, setSavingCampaignId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadCampaigns();
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiFetch<Campaign[]>('/campaigns');
      setCampaigns(response);
      const initialDrafts: Record<string, CampaignDraft> = {};
      response.forEach((campaign) => {
        initialDrafts[campaign.id] = {
          aiEnabled: campaign.aiEnabled ?? false,
          aiProvider: campaign.aiProvider ?? 'openai',
          aiModel: campaign.aiModel ?? '',
        };
      });
      setDrafts(initialDrafts);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Falha ao carregar campanhas.',
      );
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id: string, patch: Partial<CampaignDraft>) {
    setDrafts((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        ...patch,
      },
    }));
  }

  async function handleSaveCampaign(id: string) {
    const draft = drafts[id];
    if (!draft) return;

    setSavingCampaignId(id);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const body: Record<string, unknown> = {
        aiEnabled: draft.aiEnabled,
      };
      if (draft.aiEnabled) {
        body.aiProvider = draft.aiProvider;
        body.aiModel = draft.aiModel || null;
      }
      const updated = await apiFetch<Campaign>(`/campaigns/${id}`, {
        method: 'PATCH',
        body,
      });
      setCampaigns((previous) =>
        previous.map((campaign) =>
          campaign.id === id ? updated : campaign,
        ),
      );
      updateDraft(id, {
        aiEnabled: updated.aiEnabled ?? false,
        aiProvider: updated.aiProvider ?? 'openai',
        aiModel: updated.aiModel ?? '',
      });
      setFeedback(`Campanha ${updated.name} atualizada.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Falha ao atualizar a campanha.',
      );
    } finally {
      setSavingCampaignId(null);
    }
  }

  return (
    <AppShell
      title="Campanhas"
      description="Gerencie campanhas e habilite a IA Coach em cada fluxo."
      actions={
        <button
          onClick={() => void loadCampaigns()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar lista
        </button>
      }
    >
      {errorMessage ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}
      {feedback ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-50 p-4 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {loading ? (
        <section className="flex items-center justify-center rounded-2xl border border-border bg-background p-10 shadow-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando campanhas...
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">
              Campanhas cadastradas
            </h2>
            <p className="text-sm text-muted-foreground">
              Ative a IA por campanha e defina o provedor/modelo utilizados pelo N8N.
            </p>
          </header>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold">Canal</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">IA habilitada</th>
                  <th className="px-4 py-3 text-left font-semibold">Provedor</th>
                  <th className="px-4 py-3 text-left font-semibold">Modelo</th>
                  <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Nenhuma campanha cadastrada ate o momento.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => {
                    const draft = drafts[campaign.id] ?? {
                      aiEnabled: false,
                      aiProvider: 'openai',
                      aiModel: '',
                    };
                    return (
                      <tr key={campaign.id} className="bg-background">
                        <td className="px-4 py-4 font-medium">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="hover:underline"
                          >
                            {campaign.name}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {campaign.channel ?? 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {campaign.status ?? 'DRAFT'}
                        </td>
                        <td className="px-4 py-4">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={draft.aiEnabled}
                              onChange={(event) =>
                                updateDraft(campaign.id, {
                                  aiEnabled: event.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-border"
                            />
                            {draft.aiEnabled ? 'Ativa' : 'Desativada'}
                          </label>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={draft.aiProvider}
                            onChange={(event) =>
                              updateDraft(campaign.id, {
                                aiProvider: event.target.value,
                              })
                            }
                            disabled={!draft.aiEnabled}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:bg-secondary/40"
                          >
                            {AI_PROVIDER_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            value={draft.aiModel}
                            placeholder="gpt-4.1-mini"
                            onChange={(event) =>
                              updateDraft(campaign.id, {
                                aiModel: event.target.value,
                              })
                            }
                            disabled={!draft.aiEnabled}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:bg-secondary/40"
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => void handleSaveCampaign(campaign.id)}
                            disabled={savingCampaignId === campaign.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingCampaignId === campaign.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Salvar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AppShell>
  );
}
