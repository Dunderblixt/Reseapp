export interface OpenMeteoCurrentWeather {
  temperature_2m: number;
  weather_code: number;
}

interface OpenMeteoForecastResponse {
  current: OpenMeteoCurrentWeather;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isForecastResponse(
  value: unknown,
): value is OpenMeteoForecastResponse {
  if (!isRecord(value) || !isRecord(value.current)) return false;

  return (
    typeof value.current.temperature_2m === "number" &&
    typeof value.current.weather_code === "number"
  );
}

export async function fetchOpenMeteoCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<OpenMeteoCurrentWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");

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
