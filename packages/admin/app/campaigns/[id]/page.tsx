// Fallback for environments where 'next/navigation' types are not available.
// In a Next.js App Router project you can import notFound from 'next/navigation'.
// If you do have Next types available, revert this to the original import.
function notFound(): never {
  throw new Error("Not Found");
}
import { AppShell } from "../../../components/app-shell.js";
import { Copy, Eye, Save } from "lucide-react";

const campaignLibrary: Record<
  string,
  {
    name: string;
    channel: string;
    coach: string;
    status: string;
    playbook: string;
    nextAction: string;
    rules: string[];
    checklist: string[];
  }
> = {
  "cmp-001": {
    name: "Qualificacao Enterprise",
    channel: "WhatsApp",
    coach: "Coach Default B2B",
    status: "Ativa",
    playbook: "Playbook Enterprise 2025",
    nextAction:
      "Reforcar abordagem de valor e validar decisor antes de enviar proposta.",
    rules: [
      "Sempre iniciar com saudacao personalizada usando o nome completo.",
      "Nunca compartilhar precos antes de concluir checklist de qualificacao.",
      "Solicitar CNPJ apenas apos confirmar porte da empresa.",
    ],
    checklist: [
      "Confirmar decisor e cargo do contato.",
      "Validar interesse real e prazo de compra.",
      "Registrar objecoes chave no CRM.",
      "Classificar lead na etapa correta.",
    ],
  },
  "cmp-002": {
    name: "Retencao Premium",
    channel: "Voz",
    coach: "Script Retencao",
    status: "Pausada",
    playbook: "Roteiro Retencao Q4",
    nextAction:
      "Revisar script de contraoferta e validar argumentos por segmento.",
    rules: [
      "Confirmar situacao financeira antes de propor desconto.",
      "Nao oferecer upgrade sem checar elegibilidade.",
      "Registrar motivos de cancelamento com tags padrao.",
    ],
    checklist: [
      "Recuperar resumo da ultima conversa.",
      "Oferecer pacote fidelidade caso aderente.",
      "Agendar follow-up para clientes indecisos.",
    ],
  },
};

type PageProps = {
  params: { id: string };
};

export default function CampaignDetailPage({ params }: PageProps) {
  const isNew = params.id === "new";
  const data = isNew
    ? {
        name: "",
        channel: "WhatsApp",
        coach: "",
        status: "Rascunho",
        playbook: "",
        nextAction: "",
        rules: ["", "", ""],
        checklist: ["", "", ""],
      }
    : campaignLibrary[params.id];

  if (!data) {
    notFound();
  }

  return (
    <AppShell
      title={isNew ? "Nova campanha" : `Campanha: ${data.name}`}
      description="Defina canais, coach profile, regras de atendimento e checklist obrigatorio."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/60">
            <Eye className="h-4 w-4" />
            Visualizar fluxo
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/60">
            <Copy className="h-4 w-4" />
            Duplicar
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90">
            <Save className="h-4 w-4" />
            Salvar campanha
          </button>
        </div>
      }
    >
      <form className="flex flex-col gap-6">
        <section className="grid gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nome da campanha
            </label>
            <input
              defaultValue={data.name}
              placeholder="Ex. Qualificacao Enterprise"
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Canal
            </label>
            <select
              defaultValue={data.channel}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option>WhatsApp</option>
              <option>Voz</option>
              <option>Email</option>
              <option>Chat</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Coach profile
            </label>
            <select
              defaultValue={data.coach}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option>Coach Default B2B</option>
              <option>Script Retencao</option>
              <option>Onboarding Coach</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </label>
            <select
              defaultValue={data.status}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option>Rascunho</option>
              <option>Ativa</option>
              <option>Pausada</option>
              <option>Em teste</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Regua de atendimento / Playbook
            </label>
            <textarea
              defaultValue={data.playbook}
              placeholder="Descreva o objetivo, etapas e gatilhos de automacao..."
              className="min-h-[120px] rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Blocos de regras do coach
              </h2>
              <p className="text-xs text-muted-foreground">
                Cada bloco define instrucoes que o coach reforca durante a
                conversa.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {data.rules.map((rule, index) => (
                <textarea
                  key={index}
                  defaultValue={rule}
                  placeholder="Adicione regra..."
                  className="min-h-[96px] rounded-2xl border border-dashed border-border bg-secondary/50 px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Checklist obrigatorio
              </h2>
              <p className="text-xs text-muted-foreground">
                Itens que o atendente precisa marcar antes de encerrar.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/30 p-5">
              {data.checklist.map((item, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 text-xs text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-border"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-primary/40 bg-primary/10 p-6 text-primary">
          <h2 className="text-sm font-semibold">
            Proxima acao sugerida pelo coach
          </h2>
          <textarea
            defaultValue={data.nextAction}
            placeholder="Descreva a acao sugerida, gatilhos e follow-up."
            className="mt-3 min-h-[100px] rounded-2xl border border-primary/30 bg-white/40 px-4 py-3 text-sm text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </section>
      </form>
    </AppShell>
  );
}
