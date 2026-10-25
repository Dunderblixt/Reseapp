"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "@/lib/api/weather";

export function useWeather(code: string) {
  return useQuery({
    queryKey: ["weather", code],
    queryFn: () => fetchWeather(code),
    enabled: Boolean(code),
  });
}
