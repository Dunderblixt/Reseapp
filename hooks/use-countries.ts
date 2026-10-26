"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCountries } from "@/lib/api/countries";

// Fetches the country list with React Query.
export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 86_400_000,
    retry: false,
  });
}
