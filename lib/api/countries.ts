import type { Country } from "@/lib/countries";

interface CountriesApiError {
  error: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCountriesApiError(value: unknown): value is CountriesApiError {
  return isRecord(value) && typeof value.error === "string";
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isNumberPair(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function isCountry(value: unknown): value is Country {
  if (!isRecord(value) || !isRecord(value.name) || !isRecord(value.flags)) {
    return false;
  }

  const capitalInfo =
    value.capitalInfo === undefined ||
    (isRecord(value.capitalInfo) &&
      (value.capitalInfo.latlng === undefined ||
        isNumberPair(value.capitalInfo.latlng)));
  const maps =
    value.maps === undefined ||
    (isRecord(value.maps) && isOptionalString(value.maps.googleMaps));
  const capital =
    value.capital === undefined ||
    (Array.isArray(value.capital) &&
      value.capital.every((item) => typeof item === "string"));
  const languages =
    value.languages === undefined ||
    (isRecord(value.languages) &&
      Object.values(value.languages).every(
        (language) => typeof language === "string",
      ));
  const currencies =
    value.currencies === undefined ||
    (isRecord(value.currencies) &&
      Object.values(value.currencies).every(
        (currency) =>
          isRecord(currency) &&
          typeof currency.name === "string" &&
          isOptionalString(currency.symbol),
      ));

  return (
    typeof value.cca3 === "string" &&
    typeof value.name.common === "string" &&
    typeof value.name.official === "string" &&
    typeof value.population === "number" &&
    typeof value.region === "string" &&
    typeof value.flag === "string" &&
    isOptionalString(value.subregion) &&
    (value.area === undefined || typeof value.area === "number") &&
    Array.isArray(value.timezones) &&
    value.timezones.every((timezone) => typeof timezone === "string") &&
    (typeof value.flags.svg === "string" || value.flags.svg === undefined) &&
    (typeof value.flags.png === "string" || value.flags.png === undefined) &&
    isOptionalString(value.flags.alt) &&
    capitalInfo &&
    maps &&
    capital &&
    languages &&
    currencies &&
    (value.latlng === undefined || isNumberPair(value.latlng))
  );
}

function getErrorMessage(value: unknown): string | undefined {
  if (isCountriesApiError(value)) {
    return value.error;
  }
  return undefined;
}

export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch("/api/countries");
  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error("The country service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result) ?? "Could not load countries.",
    );
  }
  if (!Array.isArray(result) || !result.every(isCountry)) {
    throw new Error("The country service returned invalid country data.");
  }

  return result;
}
