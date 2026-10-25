import { NextResponse } from "next/server";
import { getCountry } from "@/lib/countries";

export const dynamic = "force-dynamic";

const weatherDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Light freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Light snowfall",
  73: "Snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with light hail",
  99: "Thunderstorm with heavy hail",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const country = await getCountry(code);

  if (!country) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  const coordinates = country.capitalInfo?.latlng ?? country.latlng;
  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json({ error: "Coordinates are unavailable for this country." }, { status: 422 });
  }

  const [latitude, longitude] = coordinates;
  const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherUrl.searchParams.set("latitude", String(latitude));
  weatherUrl.searchParams.set("longitude", String(longitude));
  weatherUrl.searchParams.set("current", "temperature_2m,weather_code");

  let response: Response;
  try {
    response = await fetch(weatherUrl, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "The weather service is currently unreachable." }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Could not fetch the weather right now." },
      { status: response.status === 404 ? 404 : 502 },
    );
  }

  let weather: { current?: { temperature_2m?: number; weather_code?: number } };
  try {
    weather = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
  } catch {
    return NextResponse.json(
      { error: "The weather service returned an invalid response." },
      { status: 502 },
    );
  }
  const temperature = weather.current?.temperature_2m;
  const weatherCode = weather.current?.weather_code;
  if (typeof temperature !== "number" || typeof weatherCode !== "number") {
    return NextResponse.json({ error: "The weather service returned invalid data." }, { status: 502 });
  }

  return NextResponse.json({
    temperature,
    description: weatherDescriptions[weatherCode] ?? "Unknown weather",
    icon: "",
    city: country.capital?.[0] ?? country.name.common,
  });
}
