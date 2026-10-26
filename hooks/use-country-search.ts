"use client";

import { useMemo } from "react";
import type { Country } from "@/lib/countries";

// Filters countries by query and region.
export function useCountrySearch(
  countries: Country[],
  query: string,
  region: string,
) {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("en");

    return countries.filter((country) => {
      const matchesQuery =
        !normalizedQuery ||
        country.name.common.toLocaleLowerCase("en").includes(normalizedQuery) ||
        country.capital?.some((capital) =>
          capital.toLocaleLowerCase("en").includes(normalizedQuery),
        );
      const matchesRegion = region === "All regions" || country.region === region;
      return matchesQuery && matchesRegion;
    });
  }, [countries, query, region]);
}
