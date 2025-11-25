'use client';

import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppTopBar } from "./app-top-bar";
import { Protected } from "./protected";

type AppShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({
  title,
  description,
  actions,
  children,
}: AppShellProps) {
  return (
    <Protected>
      <div className="min-h-screen bg-secondary/40">
        <div className="flex min-h-screen w-full">
          <AppSidebar />

          <div className="flex flex-1 flex-col">
            <AppTopBar />

            <main className="flex flex-1 flex-col gap-6 bg-background px-6 py-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                  {description ? (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  ) : null}
                </div>
                {actions ? (
                  <div className="flex items-center gap-2">{actions}</div>
                ) : null}
              </div>

              {children}
            </main>
          </div>
        </div>
      </div>
    </Protected>
  );
}
