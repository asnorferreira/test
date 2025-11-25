import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-3xl space-y-8 rounded-3xl border border-border bg-secondary/40 p-10 shadow-card">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Recuperar acesso
          </h1>
          <p className="text-sm text-muted-foreground">
            Informe seu email corporativo e enviaremos as instrucoes para criar
            uma nova senha.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <form className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email corporativo
              </label>
              <input
                type="email"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="voce@empresa.com"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              Enviar link
            </button>

            <p className="text-xs text-muted-foreground">
              Se nao receber em alguns minutos, verifique sua caixa de spam ou
              entre em contato com o administrador.
            </p>
          </form>

          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-primary/40 bg-primary/10 p-6 text-primary">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Link de redefinicao enviado
                </span>
                <span className="text-xs">
                  Valido por 30 minutos. Siga as instrucoes no email.
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-primary/30 bg-white/40 p-4 text-xs text-primary/90">
              <strong>Proxima etapa:</strong> clique em "Criar nova senha" no
              email, escolha uma senha forte e confirme usando MFA se solicitado.
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Ja lembrou a senha?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
