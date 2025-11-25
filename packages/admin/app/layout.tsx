import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "../components/auth-provider";

export const metadata: Metadata = {
  title: "Intermedius Coach Admin",
  description:
    "Plataforma de administracao para orquestrar campanhas, conectores e qualidade de atendimento.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
