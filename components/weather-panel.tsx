"use client";

import { CloudSun, Droplets, LoaderCircle, MapPin, RefreshCw, Wind } from "lucide-react";
import { useWeather } from "@/hooks/use-weather";
import { Button } from "@/components/ui/button";

export function WeatherPanel({ code }: { code: string }) {
  const { data, error, isPending, refetch } = useWeather(code);

  if (isPending) {
    return (
      <section aria-busy="true" aria-label="Loading current weather" className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-900" role="status">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          Loading current weather...
        </p>
        <div className="mt-5 h-10 w-36 animate-pulse rounded bg-stone-100" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-stone-100" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section aria-live="polite" className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Current weather</p>
        <p className="mt-3 text-sm text-stone-600">{error?.message ?? "Could not load the weather."}</p>
        <Button className="mt-4" onClick={() => void refetch()} size="sm" variant="outline">
          <RefreshCw aria-hidden="true" size={14} /> Try again
        </Button>
      </section>
    );
  }

  return (
    <section aria-label={`Current weather in ${data.city}`} className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Current weather</p>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eff3e8] text-emerald-950">
          <CloudSun aria-hidden="true" size={28} strokeWidth={1.6} />
        </span>
        <div>
          <p className="font-display text-4xl font-semibold tracking-tight text-emerald-950">{Math.round(data.temperature)}°</p>
          <p className="text-sm capitalize text-stone-600">{data.description}</p>
        </div>
      </div>
      <p className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-sm text-stone-600">
        <MapPin aria-hidden="true" className="text-emerald-700" size={15} /> {data.city}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-stone-500">
        <span className="flex items-center gap-1.5"><Droplets aria-hidden="true" size={14} /> Current conditions</span>
        <span className="flex items-center justify-end gap-1.5"><Wind aria-hidden="true" size={14} /> Live weather</span>
      </div>
    </section>
  );
}
