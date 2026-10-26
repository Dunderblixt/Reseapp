"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, TrendingUp } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { useCountries } from "@/hooks/use-countries";
import { useWeather } from "@/hooks/use-weather";
import type { Country } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WeatherQuery = ReturnType<typeof useWeather>;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function formatArea(value?: number) {
  return typeof value === "number"
    ? `${formatNumber(value)} km²`
    : "Not available";
}

function numericWinner(a?: number, b?: number): "a" | "b" | null {
  if (typeof a !== "number" || typeof b !== "number") return null;
  if (a === b) return null;
  return a > b ? "a" : "b";
}

function HighestBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-[11px] font-semibold text-[#e9f15b]">
      <TrendingUp aria-hidden="true" size={12} />
      Highest
    </span>
  );
}

function ValueCell({
  value,
  note,
  highest = false,
}: {
  value: string;
  note?: string;
  highest?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "font-display text-lg font-semibold",
          highest ? "text-emerald-950" : "text-stone-800",
        )}
      >
        {value}
      </span>
      {note && <span className="text-sm text-stone-600">{note}</span>}
      {highest && <HighestBadge />}
    </div>
  );
}

function WeatherValue({
  query,
  highest,
}: {
  query: WeatherQuery;
  highest: boolean;
}) {
  if (query.isPending) {
    return (
      <span className="flex items-center gap-2 text-sm text-stone-500" role="status">
        <LoaderCircle aria-hidden="true" className="animate-spin" size={15} />
        Loading...
      </span>
    );
  }

  if (query.error || !query.data) {
    return <span className="text-sm text-stone-500">Unavailable</span>;
  }

  return (
    <ValueCell
      highest={highest}
      note={query.data.description}
      value={`${Math.round(query.data.temperature)}°`}
    />
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="mt-10 flex justify-center">
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-900" role="status">
        <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
        {label}
      </p>
    </div>
  );
}

function NeedTwoFavourites() {
  return (
    <div className="mt-10 rounded-[24px] border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
      <TrendingUp aria-hidden="true" className="mx-auto text-emerald-800" size={28} />
      <p className="mt-4 font-display text-2xl font-semibold text-emerald-950">
        Save two favourites to compare
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
        You need at least two favourite countries. Tap the heart on countries
        you like, then come back here to compare them side by side.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Explore countries</Link>
      </Button>
    </div>
  );
}

export function CompareView({
  initialA,
  initialB,
}: {
  initialA?: string;
  initialB?: string;
}) {
  const { savedCountries, hydrated } = useAppContext();
  const { data: countries = [], error, isPending, refetch } = useCountries();
  const router = useRouter();
  const [a, setA] = useState(initialA ?? "");
  const [b, setB] = useState(initialB ?? "");

  const byCode = useMemo(
    () => new Map(countries.map((country) => [country.cca3, country])),
    [countries],
  );
  const savedSet = useMemo(() => new Set(savedCountries), [savedCountries]);
  const savedOptions = useMemo(
    () =>
      savedCountries
        .map((code) => byCode.get(code))
        .filter((country): country is Country => Boolean(country)),
    [savedCountries, byCode],
  );

  const validA =
    savedSet.has(a) && byCode.has(a) ? a : savedOptions[0]?.cca3 ?? "";
  const validB =
    savedSet.has(b) && byCode.has(b) && b !== validA
      ? b
      : savedOptions.find((country) => country.cca3 !== validA)?.cca3 ?? "";

  const weatherA = useWeather(validA);
  const weatherB = useWeather(validB);

  useEffect(() => {
    if (!hydrated || isPending || error) return;
    if (savedOptions.length < 2) return;
    if (a === validA && b === validB) return;

    setA(validA);
    setB(validB);
    const params = new URLSearchParams({ a: validA, b: validB });
    router.replace(`/favourites?${params.toString()}`, { scroll: false });
  }, [
    a,
    b,
    validA,
    validB,
    hydrated,
    isPending,
    error,
    savedOptions.length,
    router,
  ]);

  if (!hydrated) return <Loading label="Loading your favourites..." />;
  if (savedCountries.length === 0) return null;
  if (isPending) return <Loading label="Loading countries..." />;
  if (error) {
    return (
      <div
        aria-live="polite"
        className="mt-10 rounded-2xl border border-red-200 bg-white px-6 py-10 text-center"
      >
        <AlertCircle aria-hidden="true" className="mx-auto text-red-700" size={24} />
        <p className="mt-3 font-display text-xl font-medium text-emerald-950">
          Could not load the countries
        </p>
        <p className="mt-2 text-sm text-stone-600">{error.message}</p>
        <Button className="mt-5" onClick={() => void refetch()} size="sm" variant="outline">
          Try again
        </Button>
      </div>
    );
  }
  if (savedOptions.length < 2) return <NeedTwoFavourites />;

  const countryA = byCode.get(validA);
  const countryB = byCode.get(validB);
  if (!countryA || !countryB) return <NeedTwoFavourites />;

  const populationWinner = numericWinner(
    countryA.population,
    countryB.population,
  );
  const areaWinner = numericWinner(countryA.area, countryB.area);
  const temperatureWinner = numericWinner(
    weatherA.data?.temperature,
    weatherB.data?.temperature,
  );

  function handleChange(side: "a" | "b", code: string) {
    const nextA = side === "a" ? code : validA;
    const nextB = side === "b" ? code : validB;

    if (side === "a") setA(code);
    else setB(code);

    const params = new URLSearchParams({ a: nextA, b: nextB });
    router.replace(`/favourites?${params.toString()}`, { scroll: false });
  }

  return (
    <section aria-labelledby="compare-title" className="mt-14">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
        Side by side
      </p>
      <h2
        className="mb-5 font-display text-2xl font-semibold tracking-tight text-emerald-950"
        id="compare-title"
      >
        Compare favourites
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
            Country A
          </span>
          <select
            className="h-12 rounded-xl border border-stone-500 bg-white px-3 text-sm font-medium text-stone-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            onChange={(event) => handleChange("a", event.target.value)}
            value={validA}
          >
            {savedOptions.map((country) => (
              <option
                disabled={country.cca3 === validB}
                key={country.cca3}
                value={country.cca3}
              >
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
            Country B
          </span>
          <select
            className="h-12 rounded-xl border border-stone-500 bg-white px-3 text-sm font-medium text-stone-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            onChange={(event) => handleChange("b", event.target.value)}
            value={validB}
          >
            {savedOptions.map((country) => (
              <option
                disabled={country.cca3 === validA}
                key={country.cca3}
                value={country.cca3}
              >
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <caption className="sr-only">
            Comparison of {countryA.name.common} and {countryB.name.common}
          </caption>
          <thead>
            <tr className="border-b border-stone-200">
              <th
                className="p-4 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"
                scope="col"
              >
                Metric
              </th>
              <th
                className="p-4 font-display text-lg font-semibold text-emerald-950"
                scope="col"
              >
                {countryA.name.common}
              </th>
              <th
                className="p-4 font-display text-lg font-semibold text-emerald-950"
                scope="col"
              >
                {countryB.name.common}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100">
              <th
                className="p-4 text-sm font-medium text-stone-500"
                scope="row"
              >
                Population
              </th>
              <td className="p-4">
                <ValueCell
                  highest={populationWinner === "a"}
                  value={formatNumber(countryA.population)}
                />
              </td>
              <td className="p-4">
                <ValueCell
                  highest={populationWinner === "b"}
                  value={formatNumber(countryB.population)}
                />
              </td>
            </tr>
            <tr className="border-b border-stone-100">
              <th
                className="p-4 text-sm font-medium text-stone-500"
                scope="row"
              >
                Area
              </th>
              <td className="p-4">
                <ValueCell
                  highest={areaWinner === "a"}
                  value={formatArea(countryA.area)}
                />
              </td>
              <td className="p-4">
                <ValueCell
                  highest={areaWinner === "b"}
                  value={formatArea(countryB.area)}
                />
              </td>
            </tr>
            <tr>
              <th
                className="p-4 text-sm font-medium text-stone-500"
                scope="row"
              >
                Current weather
              </th>
              <td className="p-4">
                <WeatherValue
                  highest={temperatureWinner === "a"}
                  query={weatherA}
                />
              </td>
              <td className="p-4">
                <WeatherValue
                  highest={temperatureWinner === "b"}
                  query={weatherB}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-stone-500">
        The highest value in each row is labelled “Highest”. Weather shows the
        current temperature and conditions; the warmer country is labelled.
      </p>
    </section>
  );
}
