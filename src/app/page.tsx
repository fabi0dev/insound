import { Suspense } from "react";
import { SearchClient } from "@/components/search/SearchClient";
import { RecentPlayed } from "@/components/home/RecentPlayed";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <Suspense
            fallback={
              <div className="flex min-h-[200px] items-center justify-center text-sm text-zinc-400">
                Carregando…
              </div>
            }
          >
            <SearchClient />
          </Suspense>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <RecentPlayed />
          </div>
        </aside>
      </div>
    </div>
  );
}
