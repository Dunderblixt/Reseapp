import type { Metadata } from "next";
import { FavouritesView } from "@/components/favourites-view";

export const metadata: Metadata = {
  title: "Favourite countries — Nordresa",
  description:
    "Countries you have saved as favourites for your next adventure with Nordresa.",
};

export default function FavouritesPage() {
  return (
    <main className="min-h-[70vh] bg-[#faf9f5]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          Your collection
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl">
          Favourite countries
        </h1>
        <FavouritesView />
      </div>
    </main>
  );
}
