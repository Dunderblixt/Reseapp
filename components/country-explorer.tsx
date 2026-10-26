"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronLeft, ChevronRight, LoaderCircle, Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { useCountrySearch } from "@/hooks/use-country-search";
import { useCountries } from "@/hooks/use-countries";
import { CountryCard } from "@/components/country-card";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  query: z.string().max(80, "Search must be 80 characters or fewer."),
});
type SearchValues = z.infer<typeof searchSchema>;

const PAGE_SIZE = 9;
const ALL_REGIONS = "All regions";

export function CountryExplorer() {
  const [region, setRegion] = useState(ALL_REGIONS);
  const [page, setPage] = useState(1);
  const [urlReady, setUrlReady] = useState(false);
  const {
    data: countries = [],
    error,
    isPending,
    refetch,
  } = useCountries();
  const {
    register,
    watch,
    setValue,
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
  const listingParams = new URLSearchParams();
  if (query) listingParams.set("q", query);
  if (region !== ALL_REGIONS) listingParams.set("region", region);
  if (page > 1) listingParams.set("page", String(page));
  const listingQuery = listingParams.toString();
  const regions = [
    ALL_REGIONS,
    ...Array.from(new Set(countries.map((country) => country.region)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "en")),
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPage = Number(params.get("page"));

    setValue("query", params.get("q") ?? "", { shouldValidate: true });
    setRegion(params.get("region") || ALL_REGIONS);
    setPage(
      Number.isSafeInteger(initialPage) && initialPage > 0 ? initialPage : 1,
    );
    setUrlReady(true);
  }, [setValue]);

  useEffect(() => {
    if (!urlReady) return;

    const params = new URLSearchParams(window.location.search);
    params.delete("q");
    params.delete("region");
    params.delete("page");

    if (query) params.set("q", query);
    if (region !== ALL_REGIONS) params.set("region", region);
    if (page > 1) params.set("page", String(page));

    const search = params.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [page, query, region, urlReady]);

  useEffect(() => {
    if (!urlReady || isPending || error) return;

    if (
      region !== ALL_REGIONS &&
      !countries.some((country) => country.region === region)
    ) {
      setRegion(ALL_REGIONS);
      setPage(1);
      return;
    }

    if (page > pageCount) setPage(pageCount);
  }, [countries, error, isPending, page, pageCount, region, urlReady]);

  return (
    <section aria-labelledby="country-list-title" className="mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-[72px]">
      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
            The world is waiting
          </p>
          <h2
            className="font-display text-3xl font-semibold tracking-tight text-emerald-950 sm:text-[38px]"
            id="country-list-title"
          >
            Where will you go?
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {isPending
              ? "Loading countries to explore..."
              : `${new Intl.NumberFormat("en").format(countries.length)} countries to explore. A new adventure in every one.`}
          </p>
        </div>
        {!isPending && !error && <p className="text-sm text-stone-500" aria-live="polite">
          Showing <span className="font-medium text-stone-800">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of{" "}
          <span className="font-medium text-stone-800">{filtered.length}</span> countries
        </p>}
      </div>

      <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search country or capital</span>
          <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            {...register("query", { onChange: () => setPage(1) })}
            className="h-12 w-full rounded-xl border border-stone-500 bg-stone-50 pl-11 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-600 focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            placeholder="Search by country or capital..."
            type="search"
          />
        </label>
        <div className="relative flex items-center">
          <SlidersHorizontal aria-hidden="true" className="pointer-events-none absolute left-3.5 text-emerald-800" size={16} />
          <label className="sr-only" htmlFor="region-filter">Filter by region</label>
          <select
            className="h-12 w-full appearance-none rounded-xl border border-stone-500 bg-stone-50 pl-10 pr-10 text-sm font-medium text-stone-700 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:min-w-[190px]"
            id="region-filter"
            onChange={(event) => {
              setRegion(event.target.value);
              setPage(1);
            }}
            value={region}
          >
            {regions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      {errors.query && <p className="-mt-4 mb-4 text-sm text-red-700" role="alert">{errors.query.message}</p>}

      {isPending ? (
        <div aria-busy="true" className="space-y-5">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-900" role="status">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
            Loading countries...
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <div className="h-[264px] animate-pulse rounded-[20px] border border-stone-200 bg-white" key={index} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div aria-live="polite" className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <AlertCircle aria-hidden="true" className="mx-auto text-red-700" size={24} />
          <p className="mt-3 font-display text-xl font-medium text-emerald-950">Could not load countries</p>
          <p className="mt-2 text-sm text-stone-600">{error.message}</p>
          <Button className="mt-5" onClick={() => void refetch()} size="sm" variant="outline">
            Try again
          </Button>
        </div>
      ) : pageCountries.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageCountries.map((country) => (
            <CountryCard
              country={country}
              key={country.cca3}
              listingQuery={listingQuery}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-display text-xl font-medium text-emerald-950">No countries found</p>
          <p className="mt-2 text-sm text-stone-600">Try another name or choose a different region.</p>
        </div>
      )}

      {!isPending && !error && filtered.length > 0 && (
        <nav aria-label="Country pagination" className="mt-9 flex items-center justify-center gap-3">
          <Button
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
            size="sm"
            variant="outline"
          >
            <ChevronLeft aria-hidden="true" size={16} /> Previous
          </Button>
          <span className="min-w-24 text-center text-sm tabular-nums text-stone-600" aria-live="polite">
            Page {page} of {pageCount}
          </span>
          <Button
            aria-label="Next page"
            disabled={page === pageCount}
            onClick={() => setPage((current) => current + 1)}
            size="sm"
            variant="outline"
          >
            Next <ChevronRight aria-hidden="true" size={16} />
          </Button>
        </nav>
      )}
    </section>
  );
}
