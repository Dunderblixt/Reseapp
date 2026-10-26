import { ArrowDown, Globe2, Sparkles } from "lucide-react";
import { CountryExplorer } from "@/components/country-explorer";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="absolute -right-32 -top-52 size-[520px] rounded-full border border-white/[0.07]" />
        <div className="absolute -right-14 -top-36 size-[360px] rounded-full border border-white/[0.08]" />
        <div className="absolute -bottom-52 left-[40%] size-[390px] rounded-full border border-white/[0.07]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.65fr] lg:gap-16 lg:py-[90px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-emerald-100">
              <Sparkles aria-hidden="true" className="text-[#e9f15b]" size={14} />
              Find the place that feels like you
            </span>
            <h1 className="mt-6 max-w-[700px] font-display text-[46px] font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-[60px] lg:text-[72px]">
              The world is
              <br />
              <span className="text-[0.8em] font-serif italic text-[#e9f15b]">closer</span> than
              <br />
              you think.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-emerald-100/75 sm:text-[17px]">
              From familiar favorites to places you’ve barely heard of. Start with a little curiosity.
            </p>
            <a className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e9f15b] px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-[#f0f68a]" href="#countries">
              Explore all countries <ArrowDown aria-hidden="true" size={16} />
            </a>
          </div>

          <div aria-hidden="true" className="relative hidden min-h-[320px] items-center justify-center lg:flex">
            <div className="absolute size-[300px] rounded-full border border-white/10" />
            <div className="absolute size-[235px] rounded-full border border-white/10" />
            <div className="relative flex size-[174px] items-center justify-center rounded-full bg-[#e9f15b] text-emerald-950 shadow-[0_0_100px_rgba(233,241,91,0.13)]">
              <Globe2 aria-hidden="true" size={86} strokeWidth={0.8} />
            </div>
            <div className="absolute right-3 top-8 rotate-3 rounded-2xl border border-white/15 bg-[#164c3b] px-4 py-3 shadow-xl">
              <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-100/65">Next stop?</p>
              <p className="mt-1 text-sm font-semibold text-white">That’s up to you.</p>
            </div>
            <div className="absolute bottom-7 left-2 -rotate-3 rounded-2xl border border-white/15 bg-white px-4 py-3 shadow-xl">
              <p className="text-xs text-stone-500">Your journey, your pace</p>
              <p className="mt-1 text-sm font-semibold text-emerald-950">No rush, no must-dos ✦</p>
            </div>
          </div>
        </div>
      </section>

      <div id="countries">
        <CountryExplorer />
      </div>
    </main>
  );
}
