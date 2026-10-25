import Link from "next/link";
import { Compass } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200/80 bg-[#faf9f5]">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-emerald-950"
          href="/"
          aria-label="Nordresa, home"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-950 text-[#e9f15b]">
            <Compass size={19} strokeWidth={1.8} aria-hidden="true" />
          </span>
          nordresa<span className="text-emerald-700">.</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-7">
          <Link
            className="text-sm font-medium text-stone-700 transition hover:text-emerald-900"
            href="/"
          >
            Discover
          </Link>
          <a
            className="hidden text-sm font-medium text-stone-700 transition hover:text-emerald-900 sm:inline"
            href="#om-nordresa"
          >
            About Nordresa
          </a>
          <span className="hidden rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 md:inline">
            Your next journey starts here
          </span>
        </nav>
      </div>
    </header>
  );
}
