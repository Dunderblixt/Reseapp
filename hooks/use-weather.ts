"use client";

import { useQuery } from "@tanstack/react-query";

export interface Weather {
  temperature: number;
  description: string;
  icon: string;
  city: string;
}

async function fetchWeather(code: string): Promise<Weather> {
  const response = await fetch(`/api/weather/${code}`);
  if (!response.ok) {
    let result: { error?: string };
    try {
      result = (await response.json()) as { error?: string };
    } catch {
      throw new Error("Vädertjänsten returnerade ett ogiltigt svar.");
    }
    throw new Error(result.error ?? "Vädret kunde inte hämtas.");
  }
  return (await response.json()) as Weather;
}

export function useWeather(code: string) {
  return useQuery({
    queryKey: ["weather", code],
    queryFn: () => fetchWeather(code),
    enabled: Boolean(code),
  });
}
