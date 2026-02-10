"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Heart,
  ClockCounterClockwise,
  MusicNotesPlus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const mainNav = [{ href: "/", label: "Início", icon: House }];

const libraryNav = [
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/historico", label: "Histórico", icon: ClockCounterClockwise },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 flex-col border-r border-border bg-card/50 px-5 py-6 md:flex">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MusicNotesPlus weight="fill" className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              Insound
            </span>
            <span className="text-[11px] text-muted-foreground">
              Preview de 30 segundos
            </span>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {mainNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                  active
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" weight={active ? "fill" : "regular"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <p className="mt-4 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sua biblioteca
          </p>
          {libraryNav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                  active
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" weight={active ? "fill" : "regular"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-primary/30 bg-primary/10 p-3 text-[11px] text-muted-foreground">
          <p className="font-medium text-foreground">Modo preview</p>
          <p className="mt-1">
            As músicas tocam apenas 30 segundos usando a API pública da Deezer.
          </p>
        </div>
      </aside>

      <main className="relative flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/60 px-4 py-2.5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-2 md:min-h-9">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground md:hidden">
              <MusicNotesPlus weight="fill" className="size-5" />
            </div>
            <div className="hidden flex-col leading-tight md:flex">
              <span className="text-sm font-semibold tracking-tight">
                Insound
              </span>
              <span className="text-[11px] text-muted-foreground">
                Preview 30s
              </span>
            </div>
          </div>
        </header>

        <div className="relative flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-28">
          {children}
        </div>
      </main>
    </div>
  );
}
