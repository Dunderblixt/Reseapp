import Link from "next/link";
import { Compass } from "lucide-react";
import { ExplorerLink } from "@/components/explorer-link";
import { FavouritesNavLink } from "@/components/favourites-nav-link";

// Site header with logo and navigation.
export function SiteHeader() {
  return (
    <header className="border-b border-stone-200/80 bg-[#faf9f5]">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-emerald-950"
            href="/"
            aria-label="Nordtravel, home"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-950 text-[#e9f15b]">
              <Compass size={19} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="max-[359px]:hidden">
              nordtravel<span className="text-emerald-700">.</span>
            </span>
          </Link>
          <span className="hidden font-serif text-sm italic text-stone-600 md:inline">
            Your next journey starts here
          </span>
        </div>
        <nav aria-label="Main navigation" className="flex items-center gap-7">
          <ExplorerLink
            className="text-sm font-medium text-stone-700 transition hover:text-emerald-900"
            hash="countries"
          >
            Discover
          </ExplorerLink>
          <FavouritesNavLink />
        </nav>
      </div>
    </header>
  );
}
