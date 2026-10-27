export interface OpenMeteoCurrentWeather {
  temperature_2m: number;
  weather_code: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
}

interface OpenMeteoForecastResponse {
  current: OpenMeteoCurrentWeather;
}

// Type guard for plain objects.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Validates an Open-Meteo forecast response.
function isForecastResponse(
  value: unknown,
): value is OpenMeteoForecastResponse {
  if (!isRecord(value) || !isRecord(value.current)) return false;

  const { temperature_2m, weather_code, relative_humidity_2m, wind_speed_10m } =
    value.current;

  return (
    typeof temperature_2m === "number" &&
    typeof weather_code === "number" &&
    (relative_humidity_2m === undefined ||
      typeof relative_humidity_2m === "number") &&
    (wind_speed_10m === undefined || typeof wind_speed_10m === "number")
  );
}

// Fetches current weather from Open-Meteo.
export async function fetchOpenMeteoCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<OpenMeteoCurrentWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m",
  );

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch {
    throw new Error("The weather service is currently unreachable.");
  }

  if (!response.ok) {
    throw new Error("Could not fetch the weather right now.");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("The weather service returned an invalid response.");
  }

  if (!isForecastResponse(result)) {
    throw new Error("The weather service returned invalid data.");
  }

  return result.current;
}
