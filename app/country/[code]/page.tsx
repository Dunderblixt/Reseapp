import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { ArrowLeft, ArrowUpRight, Clock3, Languages, MapPin, Users } from "lucide-react";
import { CountryCard } from "@/components/country-card";
import { CountryFlag } from "@/components/country-flag";
import { WeatherPanel } from "@/components/weather-panel";
import { Button } from "@/components/ui/button";
import { getCountries, getCountry, type Country } from "@/lib/countries";
import { getCountrySummary } from "@/lib/wikipedia";
import type { WikipediaSummary } from "@/lib/wikipedia";

type CountrySummaryPromise = Promise<WikipediaSummary | null>;

function CountryHeroArtwork() {
  return (
    <>
      <div className="absolute -right-8 -top-20 size-72 rounded-full border border-emerald-950/10" />
      <div className="absolute -right-0 -top-12 size-52 rounded-full border border-emerald-950/10" />
    </>
  );
}

function WikipediaHeroImage({
  summaryPromise,
  countryName,
}: {
  summaryPromise: CountrySummaryPromise;
  countryName: string;
}) {
  const summary = use(summaryPromise);
  const image = summary?.originalimage?.source ?? summary?.thumbnail?.source;

  if (!image) return <CountryHeroArtwork />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={`Image from Wikipedia for ${countryName}`}
      className="absolute inset-0 size-full object-cover"
      fetchPriority="high"
      src={image}
    />
  );
}

function WikipediaImageSource({
  summaryPromise,
}: {
  summaryPromise: CountrySummaryPromise;
}) {
  const summary = use(summaryPromise);
  const hasImage = summary?.originalimage?.source ?? summary?.thumbnail?.source;
  const page = summary?.content_urls?.desktop?.page;

  if (!hasImage || !page) return null;

  return (
    <a
      className="absolute bottom-3 right-4 z-10 text-xs font-medium text-white/80 underline decoration-white/40 underline-offset-2 hover:text-white"
      href={page}
      rel="noreferrer"
      target="_blank"
    >
      Image source: Wikipedia
    </a>
  );
}

function WikipediaDescription({
  summaryPromise,
  fallbackDescription,
}: {
  summaryPromise: CountrySummaryPromise;
  fallbackDescription: string;
}) {
  const summary = use(summaryPromise);

  return (
    <>
      <p className="mt-4 text-[15px] leading-7 text-stone-600">
        {summary?.extract ?? fallbackDescription}
      </p>
      {summary?.content_urls?.desktop?.page && (
        <a
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 hover:decoration-emerald-800"
          href={summary.content_urls.desktop.page}
          rel="noreferrer"
          target="_blank"
        >
          Read more on Wikipedia <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      )}
    </>
  );
}

function RelatedCountries({
  countriesPromise,
  country,
  listingQuery,
}: {
  countriesPromise: Promise<Country[]>;
  country: Country;
  listingQuery: string;
}) {
  const countries = use(countriesPromise);
  const relatedCountries = countries
    .filter((item) => item.region === country.region && item.cca3 !== country.cca3)
    .slice(0, 3);

  if (relatedCountries.length === 0) return null;

  return (
    <section aria-labelledby="related-title" className="mt-14">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-emerald-800">Keep exploring</p>
      <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight text-emerald-950" id="related-title">
        More places in {country.region}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedCountries.map((related) => (
          <CountryCard
            country={related}
            key={related.cca3}
            listingQuery={listingQuery}
          />
        ))}
      </div>
    </section>
  );
}

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
      : "Country not found — Nordresa",
    description: country
      ? `Discover facts, weather, and travel inspiration for ${country.name.common}.`
      : "We couldn’t find this country.",
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function getListingQuery(searchParams: {
  q?: string | string[];
  region?: string | string[];
  page?: string | string[];
}) {
  const params = new URLSearchParams();
  const query = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const region = Array.isArray(searchParams.region)
    ? searchParams.region[0]
    : searchParams.region;
  const page = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;

  if (query && query.length <= 80) params.set("q", query);
  if (region) params.set("region", region);
  if (page && /^[1-9]\d*$/.test(page)) params.set("page", page);

  return params.toString();
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{
    q?: string | string[];
    region?: string | string[];
    page?: string | string[];
  }>;
}) {
  const [{ code }, listingParams] = await Promise.all([params, searchParams]);
  const country = await getCountry(code);
  if (!country) notFound();

  const listingQuery = getListingQuery(listingParams);
  const returnHref = listingQuery ? `/?${listingQuery}` : "/";
  const summaryPromise = getCountrySummary(country.name.common).catch((error) => {
    console.error(`Could not load Wikipedia information for ${country.name.common}.`, error);
    return null;
  });
  const countriesPromise = getCountries().catch((error) => {
    console.error("Could not load related countries.", error);
    return [];
  });
  const languages = Object.values(country.languages ?? {});
  const currency = Object.values(country.currencies ?? {})[0];
  const fallbackDescription = `${country.name.common} is in ${country.region}${country.subregion ? `, in ${country.subregion}` : ""}. It has a population of ${formatNumber(country.population)} and its capital is ${country.capital?.[0] ?? "not available"}.`;
  return (
    <main className="min-h-[70vh] bg-[#faf9f5]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <Button asChild className="mb-7" size="sm" variant="ghost">
          <Link href={returnHref}><ArrowLeft aria-hidden="true" size={16} /> Back to all countries</Link>
        </Button>

        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="relative flex min-h-[260px] items-end overflow-hidden rounded-[24px] bg-[#e8ede5] p-7 sm:min-h-[340px] sm:p-10">
              <Suspense fallback={<CountryHeroArtwork />}>
                <WikipediaHeroImage
                  countryName={country.name.common}
                  summaryPromise={summaryPromise}
                />
              </Suspense>
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/15 to-transparent" />
              <Suspense fallback={null}>
                <WikipediaImageSource
                  summaryPromise={summaryPromise}
                />
              </Suspense>
              <div className="relative z-10">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  <MapPin aria-hidden="true" size={13} /> {country.region}{country.subregion ? ` · ${country.subregion}` : ""}
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Get to know the country</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-emerald-950">
                Discover {country.name.common}
              </h2>
              <Suspense
                fallback={
                  <p className="mt-4 text-[15px] leading-7 text-stone-600">
                    {fallbackDescription}
                  </p>
                }
              >
                <WikipediaDescription
                  fallbackDescription={fallbackDescription}
                  summaryPromise={summaryPromise}
                />
              </Suspense>
            </article>

            <section aria-labelledby="facts-title" className="mt-7">
              <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight text-emerald-950" id="facts-title">
                Good to know
              </h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><MapPin aria-hidden="true" size={15} /> Capital</dt>
                  <dd className="mt-3 font-display text-xl font-semibold text-emerald-950">{country.capital?.[0] ?? "Not available"}</dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><Users aria-hidden="true" size={15} /> Population</dt>
                  <dd className="mt-3 font-display text-xl font-semibold text-emerald-950">{formatNumber(country.population)}</dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><Languages aria-hidden="true" size={15} /> Languages</dt>
                  <dd className="mt-3 font-display text-lg font-semibold text-emerald-950">{languages.slice(0, 3).join(", ") || "Not available"}</dd>
                </div>
                <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-stone-500"><Clock3 aria-hidden="true" size={15} /> Currency</dt>
                  <dd className="mt-3 font-display text-lg font-semibold text-emerald-950">
                    {currency ? `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ""}` : "Not available"}
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
                  Open in Google Maps <ArrowUpRight aria-hidden="true" size={15} />
                </a>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <WeatherPanel code={country.cca3} />
            <section className="rounded-2xl border border-stone-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Country facts</p>
              <dl className="mt-4 divide-y divide-stone-100 text-sm">
                <div className="flex justify-between gap-4 py-3 first:pt-0">
                  <dt className="text-stone-500">Region</dt><dd className="text-right font-medium text-stone-800">{country.region}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">Area</dt><dd className="text-right font-medium text-stone-800">{country.area ? `${formatNumber(country.area)} km²` : "Not available"}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3 last:pb-0">
                  <dt className="text-stone-500">Time zones</dt><dd className="text-right font-medium text-stone-800">{country.timezones?.length ?? 0}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </section>

        <Suspense fallback={null}>
          <RelatedCountries
            countriesPromise={countriesPromise}
            country={country}
            listingQuery={listingQuery}
          />
        </Suspense>
      </div>
    </main>
  );
}
