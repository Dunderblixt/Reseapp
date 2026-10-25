export interface Weather {
  temperature: number;
  description: string;
  icon: string;
  city: string;
}

interface WeatherApiError {
  error: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWeatherApiError(value: unknown): value is WeatherApiError {
  return isRecord(value) && typeof value.error === "string";
}

function getErrorMessage(value: unknown): string | undefined {
  if (isWeatherApiError(value)) {
    return value.error;
  }
  return undefined;
}

function isWeather(value: unknown): value is Weather {
  return (
    isRecord(value) &&
    typeof value.temperature === "number" &&
    typeof value.description === "string" &&
    typeof value.icon === "string" &&
    typeof value.city === "string"
  );
}

export async function fetchWeather(code: string): Promise<Weather> {
  const response = await fetch(`/api/weather/${encodeURIComponent(code)}`);
  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error("The weather service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(result) ?? "Could not load the weather.");
  }
  if (!isWeather(result)) {
    throw new Error("The weather service returned invalid weather data.");
  }

  return result;
}
