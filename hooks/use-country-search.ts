"use client";

import { useMemo } from "react";
import type { Country } from "@/lib/countries";

export function useCountrySearch(
  countries: Country[],
  query: string,
  region: string,
) {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("sv");

    return countries.filter((country) => {
      const matchesQuery =
        !normalizedQuery ||
        country.name.common.toLocaleLowerCase("sv").includes(normalizedQuery) ||
        country.capital?.some((capital) =>
          capital.toLocaleLowerCase("sv").includes(normalizedQuery),
        );
      const matchesRegion = region === "Alla regioner" || country.region === region;
      return matchesQuery && matchesRegion;
    });
  }, [countries, query, region]);
}
