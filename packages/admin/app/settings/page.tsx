'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { AppShell } from '../../components/app-shell.js';
import { apiFetch } from '../../lib/api.js';

type TenantSettings = {
  id: string;
  name: string;
  widgetEnabled: boolean;
  defaultAiProvider: string | null;
  defaultAiModel: string | null;
};

type ConnectorSummary = {
  id: string;
  provider: string;
  name: string;
};

const AI_PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (via N8N)' },
  { value: 'google', label: 'Google Gemini' },
];

const OPENAI_MODEL_HINTS = [
  'gpt-4.1-mini',
  'gpt-4o-mini',
  'gpt-4.1',
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [defaultAiProvider, setDefaultAiProvider] = useState('openai');
  const [defaultAiModel, setDefaultAiModel] = useState('gpt-4.1-mini');

  const [connectors, setConnectors] = useState<ConnectorSummary[]>([]);
  const [openAiConnectorId, setOpenAiConnectorId] = useState<string | null>(
    null,
  );
  const [openAiKey, setOpenAiKey] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [settingsResponse, connectorsResponse] = await Promise.all([
        apiFetch<TenantSettings>('/tenant-settings'),
        apiFetch<ConnectorSummary[]>('/connectors'),
      ]);

      setSettings(settingsResponse);
      setWidgetEnabled(settingsResponse.widgetEnabled);
      setDefaultAiProvider(
        settingsResponse.defaultAiProvider ?? 'openai',
      );
      setDefaultAiModel(settingsResponse.defaultAiModel ?? 'gpt-4.1-mini');

      setConnectors(connectorsResponse);
      const openAiConnector = connectorsResponse.find((connector) =>
        connector.provider.toLowerCase().includes('openai'),
      );
      setOpenAiConnectorId(openAiConnector?.id ?? null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Falha ao carregar ajustes.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const updated = await apiFetch<TenantSettings>('/tenant-settings', {
        method: 'PUT',
        body: {
          widgetEnabled,
          defaultAiProvider,
          defaultAiModel,
        },
      });
      setSettings(updated);
      setFeedback('Configuracoes salvas com sucesso.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Falha ao salvar configuracoes.',
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveOpenAiKey() {
    if (!openAiKey) {
      setErrorMessage('Informe uma chave da OpenAI para continuar.');
      return;
    }

    setSavingKey(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      if (openAiConnectorId) {
        await apiFetch(`/connectors/${openAiConnectorId}`, {
          method: 'DELETE',
        });
      }

      const connector = await apiFetch<ConnectorSummary>('/connectors', {
        method: 'POST',
        body: {
          provider: 'openai',
          name: 'OpenAI Default',
          token: openAiKey,
        },
      });

      setOpenAiConnectorId(connector.id);
      setOpenAiKey('');
      setFeedback('Chave da OpenAI atualizada.');
      await loadInitialData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Falha ao salvar a chave da OpenAI.',
      );
    } finally {
      setSavingKey(false);
    }
  }

  const actions = (
    <button
      onClick={handleSaveSettings}
      disabled={savingSettings || loading}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {savingSettings ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      Salvar ajustes
    </button>
  );

  return (
    <AppShell
      title="Configuracoes da empresa"
      description="Defina provedores de IA, habilite o widget e gerencie credenciais sensiveis."
      actions={actions}
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
            Carregando configuracoes...
          </div>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
            <header className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                AI Coach e widget
              </h2>
              <p className="text-sm text-muted-foreground">
                Determine se a assistente deve rodar para as campanhas deste tenant e habilite o widget lateral.
              </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Habilitar widget lateral
                </label>
                <label className="inline-flex items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={widgetEnabled}
                    onChange={(event) => setWidgetEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Exibir o widget Coach para agentes deste tenant.
                </label>
                <p className="text-xs text-muted-foreground">
                  Quando ativo, o snippet distribuido carregara o widget automaticamente para as conversas do tenant.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Provedor de IA padrao
                </label>
                <select
                  value={defaultAiProvider}
                  onChange={(event) => setDefaultAiProvider(event.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {AI_PROVIDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Este provedor sera utilizado quando uma campanha estiver com IA ativa mas nao definir um provedor proprio.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Modelo padrao
                </label>
                <input
                  value={defaultAiModel}
                  onChange={(event) => setDefaultAiModel(event.target.value)}
                  list="openai-models"
                  className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="gpt-4.1-mini"
                />
                <datalist id="openai-models">
                  {OPENAI_MODEL_HINTS.map((model) => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
                <p className="text-xs text-muted-foreground">
                  Opcional. Caso vazio, cada campanha devera informar o modelo ao ativar a IA.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
            <header className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                Credencial da OpenAI
              </h2>
              <p className="text-sm text-muted-foreground">
                Esta chave e compartilhada com o N8N para gerar sugestoes via API do OpenAI.
              </p>
            </header>

            <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Chave secreta
                </label>
                <input
                  type="password"
                  value={openAiKey}
                  onChange={(event) => setOpenAiKey(event.target.value)}
                  placeholder="sk-..."
                  className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-xs text-muted-foreground">
                  A chave e cifrada antes de ser salva. Utilize uma chave com permissao para /v1/models e /v1/responses.
                </p>
              </div>

              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <span>
                  Status atual:{' '}
                  {openAiConnectorId ? (
                    <span className="font-semibold text-emerald-600">Configurada</span>
                  ) : (
                    <span className="font-semibold text-amber-600">Nao configurada</span>
                  )}
                </span>
                {connectors.length > 0 ? (
                  <span>
                    Connectores cadastrados:{' '}
                    {connectors.map((connector) => connector.provider).join(', ')}
                  </span>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveOpenAiKey}
                  disabled={savingKey || !openAiKey}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {openAiConnectorId ? 'Atualizar chave' : 'Salvar chave'}
                </button>
                <button
                  onClick={() => {
                    setOpenAiKey('');
                    setFeedback(null);
                    setErrorMessage(null);
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/60"
                >
                  Limpar
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
