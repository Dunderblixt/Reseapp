import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3, Languages, MapPin, Users } from "lucide-react";
import { CountryCard } from "@/components/country-card";
import { CountryFlag } from "@/components/country-flag";
import { WeatherPanel } from "@/components/weather-panel";
import { Button } from "@/components/ui/button";
import { getCountries, getCountry } from "@/lib/countries";
import { getCountrySummary } from "@/lib/wikipedia";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const country = await getCountry(code);
  return {
    title: country
      ? `${country.name.common} — Nordresa`
      : "Landet hittades inte — Nordresa",
    description: country
      ? `Upptäck fakta, väder och reseinspiration för ${country.name.common}.`
      : "Vi kunde inte hitta det här landet.",
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("sv-SE").format(value);
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const country = await getCountry(code);
  if (!country) notFound();

  const [summary, allCountries] = await Promise.all([
    getCountrySummary(country.name.common),
    getCountries(),
  ]);
  const languages = Object.values(country.languages ?? {});
  const currency = Object.values(country.currencies ?? {})[0];
  const relatedCountries = allCountries
    .filter((item) => item.region === country.region && item.cca3 !== country.cca3)
    .slice(0, 3);

  return (
    <main className="min-h-[70vh] bg-[#faf9f5]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <Button asChild className="mb-7" size="sm" variant="ghost">
          <Link href="/"><ArrowLeft size={16} /> Tillbaka till alla länder</Link>
        </Button>

        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="relative flex min-h-[260px] items-end overflow-hidden rounded-[24px] bg-[#e8ede5] p-7 sm:min-h-[340px] sm:p-10">
              {summary?.thumbnail?.source ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`Landskap i ${country.name.common}`}
                  className="absolute inset-0 size-full object-cover"
                  src={summary.thumbnail.source}
                />
              ) : (
                <>
                  <div className="absolute -right-8 -top-20 size-72 rounded-full border border-emerald-950/10" />
                  <div className="absolute -right-0 -top-12 size-52 rounded-full border border-emerald-950/10" />
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/15 to-transparent" />
              <div className="relative z-10">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  <MapPin size={13} /> {country.region}{country.subregion ? ` · ${country.subregion}` : ""}
                </p>
                <div className="flex items-end gap-3">
                  <CountryFlag className="size-10" country={country} />
                  <h1 className="font-display text-[42px] font-semibold leading-none tracking-tight text-white sm:text-[56px]">
                    {country.name.common}
                  </h1>
                </div>
                <p className="mt-3 text-sm text-white/75">{country.name.official}</p>
              </div>
            </div>

            <article className="mt-7 rounded-[22px] border border-stone-200/80 bg-white p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">En första känsla</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-emerald-950">
                Lär känna {country.name.common}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-stone-600">
                {summary?.extract ??
                  `${country.name.common} ligger i ${country.region}${country.subregion ? `, i ${country.subregion}` : ""}. Landet har en befolkning på ${formatNumber(country.population)} invånare och huvudstaden är ${country.capital?.[0] ?? "inte angiven"}.`}
              </p>
              {summary?.content_urls?.desktop?.page && (
                <a
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 hover:decoration-emerald-800"
                  href={summary.content_urls.desktop.page}
                  rel="noreferrer"
                  target="_blank"
                >
                  Läs mer på Wikipedia <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              )}
            </article>

            <section aria-labelledby="facts-title" className="mt-7">
              <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight text-emerald-950" id="facts-title">
                Bra att veta
              </h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><MapPin size={15} /> Huvudstad</dt>
                  <dd className="mt-3 font-display text-xl font-semibold text-emerald-950">{country.capital?.[0] ?? "Ej angiven"}</dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><Users size={15} /> Befolkning</dt>
                  <dd className="mt-3 font-display text-xl font-semibold text-emerald-950">{formatNumber(country.population)}</dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><Languages size={15} /> Språk</dt>
                  <dd className="mt-3 font-display text-lg font-semibold text-emerald-950">{languages.slice(0, 3).join(", ") || "Ej angivna"}</dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><Clock3 size={15} /> Valuta</dt>
                  <dd className="mt-3 font-display text-lg font-semibold text-emerald-950">
                    {currency ? `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ""}` : "Ej angiven"}
                  </dd>
                </div>
              </dl>
              {country.maps?.googleMaps && (
                <a
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-800 hover:text-emerald-950"
                  href={country.maps.googleMaps}
                  rel="noreferrer"
                  target="_blank"
                >
                  Öppna i Google Maps <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <WeatherPanel code={country.cca3} />
            <section className="rounded-2xl border border-stone-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Landfakta</p>
              <dl className="mt-4 divide-y divide-stone-100 text-sm">
                <div className="flex justify-between gap-4 py-3 first:pt-0">
                  <dt className="text-stone-500">Region</dt><dd className="text-right font-medium text-stone-800">{country.region}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">Yta</dt><dd className="text-right font-medium text-stone-800">{country.area ? `${formatNumber(country.area)} km²` : "Ej angiven"}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3 last:pb-0">
                  <dt className="text-stone-500">Tidszoner</dt><dd className="text-right font-medium text-stone-800">{country.timezones?.length ?? 0}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </section>

        {relatedCountries.length > 0 && (
          <section aria-labelledby="related-title" className="mt-14">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-emerald-800">Fortsätt upptäcka</p>
            <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight text-emerald-950" id="related-title">
              Fler platser i {country.region}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCountries.map((related) => <CountryCard country={related} key={related.cca3} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
