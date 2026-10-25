import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const PAGE_SIZE = 12;
const API_URL = "https://api.restcountries.com/countries/v5";

type Country = {
  names: { common: string };
  codes: { alpha_2: string };
  capitals?: { name: string }[];
  flag: { emoji: string };
  region?: string;
  population?: number;
};

type CountryResponse = {
  data: {
    objects: Country[];
    meta: {
      count: number;
      offset: number;
      total: number;
    };
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCountry(value: unknown): value is Country {
  if (!isRecord(value)) return false;

  const { names, codes, capitals, flag, region, population } = value;
  return (
    isRecord(names) &&
    typeof names.common === "string" &&
    isRecord(codes) &&
    typeof codes.alpha_2 === "string" &&
    isRecord(flag) &&
    typeof flag.emoji === "string" &&
    (capitals === undefined ||
      (Array.isArray(capitals) &&
        capitals.every(
          (capital) => isRecord(capital) && typeof capital.name === "string",
        ))) &&
    (region === undefined || typeof region === "string") &&
    (population === undefined || typeof population === "number")
  );
}

function isCountryResponse(value: unknown): value is CountryResponse {
  if (!isRecord(value) || !isRecord(value.data)) return false;

  const { objects, meta } = value.data;
  return (
    Array.isArray(objects) &&
    objects.every(isCountry) &&
    isRecord(meta) &&
    typeof meta.count === "number" &&
    typeof meta.offset === "number" &&
    typeof meta.total === "number"
  );
}

async function getCountries(page: number): Promise<CountryResponse> {
  const apiKey = process.env.REST_COUNTRIES_API_KEY;
  if (!apiKey) {
    throw new Error("REST_COUNTRIES_API_KEY is not configured on the server.");
  }

  const url = new URL(API_URL);
  url.searchParams.set(
    "response_fields",
    "names.common,codes.alpha_2,capitals,flag.emoji,region,population",
  );
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String((page - 1) * PAGE_SIZE));

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 14_400 },
  });

  if (!response.ok) {
    throw new Error(`REST Countries API returned status ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (!isCountryResponse(result)) {
    throw new Error("REST Countries API returned an unexpected response.");
  }

  return result;
}

function getPageNumber(value: string | string[] | undefined): number {
  const pageValue = Array.isArray(value) ? value[0] : value;
  const page = Number(pageValue);
  const maxPage = Math.floor(Number.MAX_SAFE_INTEGER / PAGE_SIZE);

  return Number.isSafeInteger(page) && page > 0 && page <= maxPage ? page : 1;
}

function formatPopulation(population: number | undefined): string {
  return population === undefined
    ? "Population unavailable"
    : `${new Intl.NumberFormat("en").format(population)} people`;
}

async function CountryExplorer({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = getPageNumber(pageParam);

  let result: CountryResponse;
  try {
    result = await getCountries(page);
  } catch (error) {
    console.error("Unable to load countries:", error);
    return (
      <section className="error-panel country-error" role="alert">
        <p className="eyebrow">A little detour</p>
        <h2>Countries are unavailable right now.</h2>
        <p>
          {error instanceof Error
            ? error.message
            : "Please try again in a moment."}
        </p>
        <Link className="retry-link" href="/">
          Try again
        </Link>
      </section>
    );
  }

  const { objects: countries, meta } = result.data;
  const totalPages = Math.ceil(meta.total / PAGE_SIZE);

  if (totalPages > 0 && page > totalPages) {
    redirect(`/?page=${totalPages}`);
  }

  const start = meta.count === 0 ? 0 : meta.offset + 1;
  const end = meta.offset + meta.count;

  return (
    <section className="country-section" id="countries">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Start exploring</p>
          <h2>Countries</h2>
        </div>
        <p className="country-total">
          {new Intl.NumberFormat("en").format(meta.total)} destinations
        </p>
      </div>

      {countries.length > 0 ? (
        <ul className="country-grid">
          {countries.map((country) => {
            const capital = country.capitals?.[0]?.name;

            return (
              <li
                className="country-card"
                key={country.codes.alpha_2 || country.names.common}
              >
                <span className="country-flag" aria-hidden="true">
                  {country.flag.emoji || "🌍"}
                </span>
                <div className="country-info">
                  <h3>{country.names.common}</h3>
                  <p>
                    {[capital, country.region]
                      .filter(Boolean)
                      .join(" · ") || "Discover this destination"}
                  </p>
                  <span className="country-population">
                    {formatPopulation(country.population)}
                  </span>
                </div>
                <span className="country-code">
                  {country.codes.alpha_2 || "—"}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-state">No countries found on this page.</p>
      )}

      <div className="list-footer">
        <p className="result-count">
          Showing {start}–{end} of {meta.total} countries
        </p>
        <nav className="pagination" aria-label="Country list pagination">
          {page > 1 ? (
            <Link
              className="pagination-link"
              href={`/?page=${page - 1}`}
              aria-label="Previous page"
            >
              <span aria-hidden="true">←</span>
              <span>Previous</span>
            </Link>
          ) : (
            <span
              className="pagination-link is-disabled"
              aria-disabled="true"
            >
              <span aria-hidden="true">←</span>
              <span>Previous</span>
            </span>
          )}
          <span className="page-indicator">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              className="pagination-link"
              href={`/?page=${page + 1}`}
              aria-label="Next page"
            >
              <span>Next</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span
              className="pagination-link is-disabled"
              aria-disabled="true"
            >
              <span>Next</span>
              <span aria-hidden="true">→</span>
            </span>
          )}
        </nav>
      </div>
    </section>
  );
}

function CountryLoading() {
  return (
    <section className="country-section" id="countries" aria-busy="true">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Start exploring</p>
          <h2>Countries</h2>
        </div>
      </div>
      <p className="loading-state" role="status">
        Loading destinations…
      </p>
    </section>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <>
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <Link className="brand" href="/" aria-label="Nordresa home">
            <span className="brand-mark" aria-hidden="true">
              N
            </span>
            <span>Nordresa</span>
          </Link>
          <Link className="nav-link" href="#countries">
            Explore
          </Link>
        </nav>
      </header>
      <main className="page-shell" id="explore">
        <section className="intro">
          <p className="eyebrow">The world, at your fingertips</p>
          <h1>Find your somewhere.</h1>
          <p>
            Get inspired for your next journey. Explore countries from around
            the world.
          </p>
        </section>
        <Suspense fallback={<CountryLoading />}>
          <CountryExplorer searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
