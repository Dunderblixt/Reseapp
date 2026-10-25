"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import type { Country } from "@/lib/countries";
import { useCountrySearch } from "@/hooks/use-country-search";
import { CountryCard } from "@/components/country-card";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  query: z.string().max(80, "Sökningen får vara högst 80 tecken."),
});
type SearchValues = z.infer<typeof searchSchema>;

const PAGE_SIZE = 9;

async function fetchCountries(): Promise<Country[]> {
  const response = await fetch("/api/countries");
  if (!response.ok) {
    const result = (await response.json()) as { error?: string };
    throw new Error(result.error ?? "Länderna kunde inte hämtas.");
  }
  return (await response.json()) as Country[];
}

export function CountryExplorer() {
  const [region, setRegion] = useState("Alla regioner");
  const [page, setPage] = useState(1);
  const {
    data: countries = [],
    error,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 86_400_000,
    retry: false,
  });
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
    mode: "onChange",
  });
  const query = watch("query");
  const filtered = useCountrySearch(countries, query, region);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageCountries = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const regions = [
    "Alla regioner",
    ...Array.from(new Set(countries.map((country) => country.region)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "sv")),
  ];

  useEffect(() => setPage(1), [query, region]);

  return (
    <section aria-labelledby="country-list-title" className="mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-[72px]">
      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Världen väntar
          </p>
          <h2
            className="font-display text-3xl font-semibold tracking-tight text-emerald-950 sm:text-[38px]"
            id="country-list-title"
          >
            Vart vill du?
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {isPending
              ? "Hämtar länder att upptäcka..."
              : `${new Intl.NumberFormat("sv-SE").format(countries.length)} länder att upptäcka. Ett nytt äventyr i varje.`}
          </p>
        </div>
        {!isPending && !error && <p className="text-sm text-stone-500" aria-live="polite">
          Visar <span className="font-medium text-stone-800">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> av{" "}
          <span className="font-medium text-stone-800">{filtered.length}</span> länder
        </p>}
      </div>

      <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Sök land eller huvudstad</span>
          <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            {...register("query")}
            className="h-12 w-full rounded-xl border border-transparent bg-stone-50 pl-11 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10"
            placeholder="Sök på land eller huvudstad..."
            type="search"
          />
        </label>
        <div className="relative flex items-center">
          <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3.5 text-emerald-800" size={16} />
          <label className="sr-only" htmlFor="region-filter">Filtrera efter region</label>
          <select
            className="h-12 w-full appearance-none rounded-xl border border-transparent bg-stone-50 pl-10 pr-10 text-sm font-medium text-stone-700 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 sm:min-w-[190px]"
            id="region-filter"
            onChange={(event) => setRegion(event.target.value)}
            value={region}
          >
            {regions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      {errors.query && <p className="-mt-4 mb-4 text-sm text-red-700" role="alert">{errors.query.message}</p>}

      {isPending ? (
        <div aria-busy="true" aria-label="Hämtar länder" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div className="h-[264px] animate-pulse rounded-[20px] border border-stone-200 bg-white" key={index} />
          ))}
        </div>
      ) : error ? (
        <div aria-live="polite" className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <AlertCircle aria-hidden="true" className="mx-auto text-red-700" size={24} />
          <p className="mt-3 font-display text-xl font-medium text-emerald-950">Länderna kunde inte hämtas</p>
          <p className="mt-2 text-sm text-stone-600">{error.message}</p>
          <Button className="mt-5" onClick={() => void refetch()} size="sm" variant="outline">
            Försök igen
          </Button>
        </div>
      ) : pageCountries.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageCountries.map((country) => <CountryCard country={country} key={country.cca3} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-display text-xl font-medium text-emerald-950">Inga länder hittades</p>
          <p className="mt-2 text-sm text-stone-600">Prova ett annat namn eller välj en annan region.</p>
        </div>
      )}

      {!isPending && !error && filtered.length > 0 && (
        <nav aria-label="Sidnavigering för länder" className="mt-9 flex items-center justify-center gap-3">
          <Button
            aria-label="Föregående sida"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            size="sm"
            variant="outline"
          >
            <ChevronLeft size={16} /> Föregående
          </Button>
          <span className="min-w-24 text-center text-sm tabular-nums text-stone-600" aria-live="polite">
            Sida {page} av {pageCount}
          </span>
          <Button
            aria-label="Nästa sida"
            disabled={page === pageCount}
            onClick={() => setPage((current) => current + 1)}
            size="sm"
            variant="outline"
          >
            Nästa <ChevronRight size={16} />
          </Button>
        </nav>
      )}
    </section>
  );
}
