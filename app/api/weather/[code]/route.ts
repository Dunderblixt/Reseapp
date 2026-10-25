import { NextResponse } from "next/server";
import { getCountry } from "@/lib/countries";
import {
  fetchOpenMeteoCurrentWeather,
  type OpenMeteoCurrentWeather,
} from "@/lib/open-meteo";

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
  let country: Awaited<ReturnType<typeof getCountry>>;
  try {
    country = await getCountry(code);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load country data from REST Countries.";
    console.error("Could not load country data for the weather request.", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!country) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  const coordinates = country.capitalInfo?.latlng;
  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json(
      {
        error: `Weather is unavailable because REST Countries has no coordinates for the capital of ${country.name.common}.`,
      },
      { status: 422 },
    );
  }

  const [latitude, longitude] = coordinates;
  let currentWeather: OpenMeteoCurrentWeather;
  try {
    currentWeather = await fetchOpenMeteoCurrentWeather(latitude, longitude);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not fetch the weather right now.";
    console.error("Could not load current weather from Open-Meteo.", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    temperature: currentWeather.temperature_2m,
    description: weatherDescriptions[currentWeather.weather_code] ?? "Unknown weather",
    icon: "",
    city: country.capital?.[0] ?? country.name.common,
  });
}
