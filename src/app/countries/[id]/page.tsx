import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCountryByUuid } from "@/lib/countries";

function formatNumber(value: number | undefined): string {
  return value === undefined ? "Not available" : new Intl.NumberFormat("en").format(value);
}

function formatList(values: string[] | undefined): string {
  return values?.length ? values.join(", ") : "Not available";
}

async function CountryDetails({ id }: { id: string }) {
  if (!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) {
    notFound();
  }

  let country;
  try {
    country = await getCountryByUuid(id);
  } catch (error) {
    console.error("Unable to load country details:", error);
    return (
      <section className="detail-error" role="alert">
        <p className="eyebrow">A little detour</p>
        <h1>Country details are unavailable right now.</h1>
        <p>
          {error instanceof Error
            ? error.message
            : "Please try again in a moment."}
        </p>
        <Link className="retry-link" href={`/countries/${encodeURIComponent(id)}`}>
          Try again
        </Link>
      </section>
    );
  }

  if (!country) notFound();

  const capitals = country.capitals?.map((capital) => capital.name);
  const currencies = country.currencies?.map((currency) =>
    [currency.name, currency.symbol ? `(${currency.symbol})` : undefined]
      .filter(Boolean)
      .join(" "),
  );
  const languages = country.languages?.map((language) =>
    language.native_name
      ? `${language.name} (${language.native_name})`
      : language.name,
  );
  const facts = [
    { label: "Capital", value: formatList(capitals) },
    { label: "Region", value: country.region ?? "Not available" },
    { label: "Subregion", value: country.subregion ?? "Not available" },
    {
      label: "Population",
      value: country.population === undefined
        ? "Not available"
        : `${formatNumber(country.population)} people`,
    },
    {
      label: "Area",
      value: country.area
        ? `${formatNumber(country.area.kilometers)} km²`
        : "Not available",
    },
    { label: "Currency", value: formatList(currencies) },
    { label: "Languages", value: formatList(languages) },
    { label: "Continents", value: formatList(country.continents) },
    { label: "Time zones", value: formatList(country.timezones) },
    { label: "Bordering countries (ISO-3)", value: formatList(country.borders) },
    {
      label: "Country codes",
      value: [country.codes.alpha_2, country.codes.alpha_3]
        .filter(Boolean)
        .join(" · ") || "Not available",
    },
  ];

  return (
    <article className="country-detail">
      <Link className="back-link" href="/">
        <span aria-hidden="true">←</span> Back to all countries
      </Link>

      <header className="detail-hero">
        <span className="detail-flag" aria-hidden="true">
          {country.flag.emoji || "🌍"}
        </span>
        <div>
          <p className="eyebrow">
            {[country.region, country.subregion].filter(Boolean).join(" · ") ||
              "Country profile"}
          </p>
          <h1>{country.names.common}</h1>
          {country.names.official && (
            <p className="official-name">{country.names.official}</p>
          )}
        </div>
      </header>

      <section className="detail-section" aria-labelledby="overview-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 id="overview-heading">Country overview</h2>
          </div>
        </div>
        <dl className="fact-grid">
          {facts.map(({ label, value }) => (
            <div className="fact-card" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}

function CountryDetailsLoading() {
  return (
    <section className="detail-loading" aria-busy="true">
      <p className="loading-state" role="status">
        Loading country details…
      </p>
    </section>
  );
}

async function CountryRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CountryDetails id={id} />;
}

export default function CountryPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
          <Link className="nav-link" href="/">
            Explore
          </Link>
        </nav>
      </header>
      <main className="page-shell detail-page">
        <Suspense fallback={<CountryDetailsLoading />}>
          <CountryRoute params={params} />
        </Suspense>
      </main>
    </>
  );
}
