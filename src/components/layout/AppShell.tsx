"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Heart,
  ClockCounterClockwise,
  MusicNotesPlus,
} from "@phosphor-icons/react";
import { PlayerBar } from "@/components/player/PlayerBar";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; weight: "fill" | "regular" }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 ease-out",
        active
          ? "bg-accent text-primary"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:translate-x-0.5",
      )}
    >
      <Icon className="size-4 transition-transform duration-200" weight={active ? "fill" : "regular"} />
      <span>{label}</span>
    </Link>
  );
}

const mainNav = [{ href: "/", label: "Início", icon: House }];

const libraryNav = [
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/history", label: "Histórico", icon: ClockCounterClockwise },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-border bg-card/50 px-5 py-6 md:flex">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MusicNotesPlus weight="fill" className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              Insound
            </span>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          ))}
          <p className="mt-4 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sua biblioteca
          </p>
          {libraryNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-primary/30 bg-primary/10 p-3 text-[11px] text-muted-foreground">
          <p className="font-medium text-foreground">Modo preview</p>
          <p className="mt-1">
            As músicas tocam apenas 30 segundos usando a API pública da Deezer.
          </p>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <main className="relative flex flex-1 flex-col">
          <div
            key={pathname}
            className="animate-fade-up relative flex-1 px-4 pb-36 pt-4 md:px-8 md:pb-40"
          >
            {children}
          </div>
        </main>
        <PlayerBar />
      </div>
    </div>
  );
}
