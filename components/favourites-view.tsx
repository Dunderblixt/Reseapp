"use client";

import { AlertCircle, Heart, LoaderCircle } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { useCountries } from "@/hooks/use-countries";
import { CountryCard } from "@/components/country-card";
import { ExplorerLink } from "@/components/explorer-link";
import { Button } from "@/components/ui/button";

// Lists the user's saved countries.
export function FavouritesView() {
  const { savedCountries, hydrated } = useAppContext();
  const { data: countries = [], error, isPending, refetch } = useCountries();

  if (!hydrated) {
    return (
      <div aria-busy="true" className="mt-10 flex justify-center">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-900" role="status">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          Loading your favourites...
        </p>
      </div>
    );
  }

  if (savedCountries.length === 0) {
    return (
      <div className="mt-10 rounded-[24px] border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#eff3e8] text-emerald-900">
          <Heart aria-hidden="true" size={26} />
        </span>
        <p className="mt-5 font-display text-2xl font-semibold text-emerald-950">
          No favourite countries yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
          Tap the heart on any country to save it here, then come back to plan
          your next adventure.
        </p>
        <Button asChild className="mt-6">
          <ExplorerLink>Explore countries</ExplorerLink>
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div aria-busy="true" className="mt-10 flex justify-center">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-900" role="status">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          Loading your favourite countries...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div aria-live="polite" className="mt-10 rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
        <AlertCircle aria-hidden="true" className="mx-auto text-red-700" size={24} />
        <p className="mt-3 font-display text-xl font-medium text-emerald-950">
          Could not load your countries
        </p>
        <p className="mt-2 text-sm text-stone-600">{error.message}</p>
        <Button className="mt-5" onClick={() => void refetch()} size="sm" variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  const byCode = new Map(countries.map((country) => [country.cca3, country]));
  const favourites = savedCountries.flatMap((code) => {
    const country = byCode.get(code);
    return country ? [country] : [];
  });

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {favourites.map((country) => (
        <CountryCard country={country} key={country.cca3} />
      ))}
    </div>
  );
}
