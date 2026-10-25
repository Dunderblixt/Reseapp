export const COUNTRY_PAGE_SIZE = 12;

const API_URL = "https://api.restcountries.com/countries/v5";
const COUNTRY_FIELDS =
  "uuid,names.common,names.official,codes.alpha_2,codes.alpha_3,capitals,flag.emoji,region,subregion,population,area,currencies,languages,timezones,continents,borders";
const SUMMARY_FIELDS =
  "uuid,names.common,codes.alpha_2,codes.alpha_3,capitals,flag.emoji,region,population";

type Currency = {
  code: string;
  name: string;
  symbol?: string;
};

type Language = {
  name: string;
  native_name?: string;
};

export type Country = {
  uuid: string;
  names: { common: string; official?: string };
  codes: { alpha_2: string; alpha_3?: string };
  capitals?: { name: string }[];
  flag: { emoji: string };
  region?: string;
  subregion?: string;
  population?: number;
  area?: { kilometers: number; miles: number };
  currencies?: Currency[];
  languages?: Language[];
  timezones?: string[];
  continents?: string[];
  borders?: string[];
};

type CountryListResponse = {
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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isCountry(value: unknown): value is Country {
  if (!isRecord(value)) return false;

  const { names, codes, capitals, flag, region, population } = value;
  return (
    typeof value.uuid === "string" &&
    isRecord(names) &&
    typeof names.common === "string" &&
    (names.official === undefined || typeof names.official === "string") &&
    isRecord(codes) &&
    typeof codes.alpha_2 === "string" &&
    (codes.alpha_3 === undefined || typeof codes.alpha_3 === "string") &&
    isRecord(flag) &&
    typeof flag.emoji === "string" &&
    (capitals === undefined ||
      (Array.isArray(capitals) &&
        capitals.every(
          (capital) => isRecord(capital) && typeof capital.name === "string",
        ))) &&
    (region === undefined || typeof region === "string") &&
    (value.subregion === undefined || typeof value.subregion === "string") &&
    (population === undefined || typeof population === "number") &&
    (value.area === undefined ||
      (isRecord(value.area) &&
        typeof value.area.kilometers === "number" &&
        typeof value.area.miles === "number")) &&
    (value.currencies === undefined ||
      (Array.isArray(value.currencies) &&
        value.currencies.every(
          (currency) =>
            isRecord(currency) &&
            typeof currency.code === "string" &&
            typeof currency.name === "string" &&
            (currency.symbol === undefined ||
              typeof currency.symbol === "string"),
        ))) &&
    (value.languages === undefined ||
      (Array.isArray(value.languages) &&
        value.languages.every(
          (language) =>
            isRecord(language) &&
            typeof language.name === "string" &&
            (language.native_name === undefined ||
              typeof language.native_name === "string"),
        ))) &&
    (value.timezones === undefined || isStringArray(value.timezones)) &&
    (value.continents === undefined || isStringArray(value.continents)) &&
    (value.borders === undefined || isStringArray(value.borders))
  );
}

function isCountryListResponse(value: unknown): value is CountryListResponse {
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

async function fetchCountryResponse(url: URL): Promise<CountryListResponse> {
  const apiKey = process.env.REST_COUNTRIES_API_KEY;
  if (!apiKey) {
    throw new Error("REST_COUNTRIES_API_KEY is not configured on the server.");
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 14_400 },
  });

  if (!response.ok) {
    throw new Error(`REST Countries API returned status ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (!isCountryListResponse(result)) {
    throw new Error("REST Countries API returned an unexpected response.");
  }

  return result;
}

export async function getCountries(page: number): Promise<CountryListResponse> {
  const url = new URL(API_URL);
  url.searchParams.set("response_fields", SUMMARY_FIELDS);
  url.searchParams.set("limit", String(COUNTRY_PAGE_SIZE));
  url.searchParams.set(
    "offset",
    String((page - 1) * COUNTRY_PAGE_SIZE),
  );
  return fetchCountryResponse(url);
}

export async function getCountryByUuid(uuid: string): Promise<Country | null> {
  const url = new URL(`${API_URL}/uuid/${encodeURIComponent(uuid)}`);
  url.searchParams.set("response_fields", COUNTRY_FIELDS);

  const result = await fetchCountryResponse(url);
  return result.data.objects[0] ?? null;
}
