"use client";

import Link from "next/link";
import { useAppContext } from "@/context/app-context";

export function FavouritesNavLink() {
  const { savedCountries, hydrated } = useAppContext();
  const count = savedCountries.length;
  const showCount = hydrated && count > 0;
  const label =
    count > 0
      ? `Favourites, ${count} saved ${count === 1 ? "country" : "countries"}`
      : "Favourites";

  return (
    <Link
      aria-label={label}
      className="flex items-center gap-1.5 text-sm font-medium text-stone-700 transition hover:text-emerald-900"
      href="/favourites"
    >
      <span>Favourites</span>
      {showCount && (
        <span
          aria-hidden="true"
          className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-950 px-1.5 text-[11px] font-semibold leading-5 text-[#e9f15b]"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
