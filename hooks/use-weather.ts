"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "@/lib/api/weather";

// Fetches current weather for a country.
export function useWeather(code: string) {
  return useQuery({
    queryKey: ["weather", code],
    queryFn: () => fetchWeather(code),
    gcTime: 900_000, // 15 minutes
    staleTime: 900_000, // 15 minutes
    enabled: Boolean(code),
  });
}
