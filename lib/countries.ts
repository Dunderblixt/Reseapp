export interface Country {
  cca3: string;
  name: {
    common: string;
    official: string;
    native?: Record<string, { common: string; official?: string }>;
  };
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area?: number;
  flag: string;
  flags: { svg?: string; png?: string; alt?: string };
  capitalInfo?: { latlng?: [number, number] };
  currencies?: Record<string, { name: string; symbol?: string }>;
  languages?: Record<string, string>;
  timezones: string[];
  latlng?: [number, number];
  maps?: { googleMaps?: string };
}

const PAGE_SIZE = 100;

const FALLBACK_FLAG_URLS: Record<string, string> = {
  abkhazia:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Abkhazia.svg?width=160",
  "northern-cyprus":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg?width=160",
  somaliland:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Somaliland.svg?width=160",
  "south-ossetia":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_South_Ossetia.svg?width=160",
};

interface RestCountryRecord {
  names?: {
    common?: string;
    official?: string;
    native?: Record<string, { common?: string; official?: string }>;
  };
  codes?: { alpha_2?: string; alpha_3?: string };
  capitals?: { name?: string; coordinates?: { lat?: number; lng?: number } }[];
  flag?: {
    emoji?: string;
    url_svg?: string;
    url_png?: string;
    description?: string;
  };
  region?: string;
  subregion?: string;
  population?: number;
  area?: { kilometers?: number };
  coordinates?: { lat?: number; lng?: number };
  currencies?: { code?: string; name?: string; symbol?: string }[];
  languages?:
    | Record<string, string>
    | { bcp47?: string; iso639_3?: string; name?: string }[];
  timezones?: string[];
}

interface RestCountriesResponse {
  data?: {
    objects?: RestCountryRecord[];
    meta?: { total?: number };
  };
  errors?: { message?: string }[];
}

// Maps REST Countries errors to readable messages.
function getRestCountriesErrorMessage(
  status: number,
  apiMessage?: string,
): string {
  const details = apiMessage?.toLocaleLowerCase("en") ?? "";

  if (
    status === 401 ||
    /invalid (api )?key|api key.*invalid|unauthori[sz]ed/.test(details)
  ) {
    return "The REST Countries API key is invalid or unauthorized. Check REST_COUNTRIES_API_KEY.";
  }

  if (status === 429) {
    return "The REST Countries API is receiving too many requests. Wait a moment before trying again.";
  }

  if (
    status === 403 &&
    /quota|monthly|request limit|frozen|usage limit/.test(details)
  ) {
    return "The REST Countries monthly request quota has been exceeded. Check your API usage or upgrade your plan.";
  }

  if (status === 403) {
    return "The REST Countries API denied access. The monthly quota may be exhausted, or the API key account may be disabled. Check your API usage and account status.";
  }

  return apiMessage ?? `Could not fetch countries (HTTP ${status}).`;
}

// Reads the REST Countries API key from the environment.
function getApiKey() {
  const apiKey = process.env.REST_COUNTRIES_API_KEY;
  if (!apiKey) {
    throw new Error(
      "REST_COUNTRIES_API_KEY is missing. Add it to .env.local or your hosting provider’s environment variables.",
    );
  }
  return apiKey;
}

// Fetches one page of countries from the API.
async function fetchCountryPage(apiKey: string, offset: number) {
  const url = new URL("https://api.restcountries.com/countries/v5");
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 86400 },
  });

  const responseBody = await response.text();
  let result: RestCountriesResponse;
  try {
    result = JSON.parse(responseBody) as RestCountriesResponse;
  } catch {
    if (!response.ok) {
      throw new Error(getRestCountriesErrorMessage(response.status));
    }
    throw new Error("Rest Countries returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      getRestCountriesErrorMessage(
        response.status,
        result.errors?.[0]?.message,
      ),
    );
  }

  const records = result.data?.objects;
  if (!records) {
    throw new Error("Rest Countries returned no country list.");
  }

  return { records, total: result.data?.meta?.total };
}

// Normalizes the API's language data.
function asLanguageRecord(entries: RestCountryRecord["languages"]) {
  if (!entries) return {};
  if (!Array.isArray(entries)) return entries;

  return Object.fromEntries(
    entries
      .flatMap((entry) => {
        const code = entry.bcp47 || entry.iso639_3;
        return code && entry.name ? [[code, entry.name]] : [];
      }),
  );
}

// Normalizes the API's native names.
function toNativeNames(
  native: Record<string, { common?: string; official?: string }> | undefined,
): Record<string, { common: string; official?: string }> | undefined {
  if (!native) return undefined;

  const result: Record<string, { common: string; official?: string }> = {};

  for (const [code, value] of Object.entries(native)) {
    const common = value?.common ?? value?.official;
    if (common) {
      result[code] = { common, official: value?.official };
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

// Maps a REST Countries record to a Country.
function toCountry(record: RestCountryRecord): Country {
  const commonName = record.names?.common;
  const code =
    record.codes?.alpha_3 ||
    record.codes?.alpha_2 ||
    commonName?.toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, "-");
  const population = record.population;

  if (!commonName || !code || typeof population !== "number") {
    throw new Error("Rest Countries returned a country with incomplete basic data.");
  }

  const lat = record.coordinates?.lat;
  const lng = record.coordinates?.lng;
  const capital = record.capitals?.[0];
  const capitalLat = capital?.coordinates?.lat;
  const capitalLng = capital?.coordinates?.lng;
  const currencies = record.currencies
    ?.filter((currency) => currency.code && currency.name)
    .map((currency) => [currency.code!, { name: currency.name!, symbol: currency.symbol }]);
  const currencyRecord = Object.fromEntries(currencies ?? []);
  const fallbackFlag = FALLBACK_FLAG_URLS[code];

  return {
    cca3: code,
    name: {
      common: commonName,
      official: record.names?.official ?? commonName,
      native: toNativeNames(record.names?.native),
    },
    capital: record.capitals
      ?.map((item) => item.name)
      .filter((name): name is string => Boolean(name)),
    region: record.region || "Other",
    subregion: record.subregion,
    population,
    area: record.area?.kilometers,
    flag: record.flag?.emoji || "🏳️",
    flags: {
      svg: record.flag?.url_svg || undefined,
      png: record.flag?.url_png || fallbackFlag || undefined,
      alt: record.flag?.description || undefined,
    },
    capitalInfo:
      typeof capitalLat === "number" && typeof capitalLng === "number"
        ? { latlng: [capitalLat, capitalLng] }
        : undefined,
    currencies: currencyRecord,
    languages: asLanguageRecord(record.languages),
    timezones: record.timezones ?? [],
    latlng:
      typeof lat === "number" && typeof lng === "number" ? [lat, lng] : undefined,
    maps:
      typeof lat === "number" && typeof lng === "number"
        ? { googleMaps: `https://www.google.com/maps?q=${lat},${lng}` }
        : undefined,
  };
}

// Fetches and sorts all countries.
export async function getCountries(): Promise<Country[]> {
  const apiKey = getApiKey();
  const firstPage = await fetchCountryPage(apiKey, 0);
  const total = firstPage.total;
  if (typeof total !== "number" || total < firstPage.records.length) {
    throw new Error("Rest Countries returned an invalid number of countries.");
  }
  const offsets = Array.from(
    { length: Math.ceil(total / PAGE_SIZE) - 1 },
    (_, index) => (index + 1) * PAGE_SIZE,
  );
  const remainingPages = await Promise.all(
    offsets.map((offset) => fetchCountryPage(apiKey, offset)),
  );
  const records = [firstPage.records, ...remainingPages.map((page) => page.records)].flat();
  if (records.length !== total) {
    throw new Error(
      `Rest Countries returned ${records.length} of ${total} countries.`,
    );
  }

  return records.map(toCountry).sort((a, b) =>
    a.name.common.localeCompare(b.name.common, "en"),
  );
}

// Finds one country by its code.
export async function getCountry(code: string): Promise<Country | undefined> {
  const countries = await getCountries();
  return countries.find(
    (country) => country.cca3.toLowerCase() === code.toLowerCase(),
  );
}
