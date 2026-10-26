"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import type { Country } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/country-flag";
import { cn } from "@/lib/utils";

// Formats the population with thousands separators.
function formatPopulation(population: number) {
  return new Intl.NumberFormat("en").format(population);
}

// Country card with flag, facts, and save toggle.
export function CountryCard({
  country,
  listingQuery = "",
}: {
  country: Country;
  listingQuery?: string;
}) {
  const { isSaved, toggleSavedCountry } = useAppContext();
  const saved = isSaved(country.cca3);

  return (
    <article className="country-card group flex h-full flex-col overflow-hidden rounded-[20px] border border-stone-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_14px_40px_rgba(27,53,39,0.09)]">
      <div className="relative min-h-40 overflow-hidden bg-[#e8ede5] p-5">
        <span className="absolute -right-9 -top-16 size-44 rounded-full border border-emerald-950/10 transition duration-500 group-hover:scale-125" />
        <span className="absolute -right-1 -top-7 size-32 rounded-full border border-emerald-950/10 transition duration-500 group-hover:scale-125" />
        <Button
          aria-label={saved ? `Remove ${country.name.common} from saved countries` : `Save ${country.name.common}`}
          aria-pressed={saved}
          className={cn(
            "absolute right-3 top-3 z-10",
            saved ? "text-rose-600 hover:text-rose-700" : "",
          )}
          onClick={() => toggleSavedCountry(country.cca3)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Heart aria-hidden="true" size={19} fill={saved ? "currentColor" : "none"} />
        </Button>
        <Link
          className="relative flex min-h-[120px] flex-col justify-between text-inherit no-underline"
          href={`/country/${country.cca3.toLowerCase()}${listingQuery ? `?${listingQuery}` : ""}`}
          aria-label={`Learn more about ${country.name.common}`}
        >
          <CountryFlag className="size-10" country={country} />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold tracking-wide text-emerald-900">
                Region: {country.region}
              </p>
              <h2 className="font-display text-[23px] font-semibold leading-tight tracking-tight text-emerald-950">
                {country.name.common}
              </h2>
            </div>
            <span className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-950/15 bg-white/60 text-emerald-950 transition group-hover:bg-emerald-950 group-hover:text-white">
              <ArrowUpRight aria-hidden="true" size={17} />
            </span>
          </div>
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-between px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <MapPin aria-hidden="true" className="text-emerald-700" size={15} />
          <span>{country.capital?.[0] ?? "Capital unavailable"}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
          <span>Population</span>
          <span className="font-medium tabular-nums text-stone-700">
            {formatPopulation(country.population)}
          </span>
        </div>
      </div>
    </article>
  );
}
