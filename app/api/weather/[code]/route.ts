import { NextResponse } from "next/server";
import { getCountry } from "@/lib/countries";

export const dynamic = "force-dynamic";

const weatherDescriptions: Record<number, string> = {
  0: "Klar himmel",
  1: "Mestadels klart",
  2: "Delvis molnigt",
  3: "Mulet",
  45: "Dimma",
  48: "Rimfrost",
  51: "Lätt duggregn",
  53: "Duggregn",
  55: "Kraftigt duggregn",
  56: "Lätt underkylt duggregn",
  57: "Kraftigt underkylt duggregn",
  61: "Lätt regn",
  63: "Regn",
  65: "Kraftigt regn",
  66: "Lätt underkylt regn",
  67: "Kraftigt underkylt regn",
  71: "Lätt snöfall",
  73: "Snöfall",
  75: "Kraftigt snöfall",
  77: "Snökorn",
  80: "Lätta regnskurar",
  81: "Regnskurar",
  82: "Kraftiga regnskurar",
  85: "Lätta snöbyar",
  86: "Kraftiga snöbyar",
  95: "Åska",
  96: "Åska med lätt hagel",
  99: "Åska med kraftigt hagel",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const country = await getCountry(code);

  if (!country) {
    return NextResponse.json({ error: "Landet kunde inte hittas." }, { status: 404 });
  }

  const coordinates = country.capitalInfo?.latlng ?? country.latlng;
  if (!coordinates || coordinates.length < 2) {
    return NextResponse.json({ error: "Det saknas koordinater för landet." }, { status: 422 });
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
    return NextResponse.json({ error: "Vädertjänsten kan inte nås just nu." }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Vädret kunde inte hämtas just nu." },
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
      { error: "Vädertjänsten returnerade ett ogiltigt svar." },
      { status: 502 },
    );
  }
  const temperature = weather.current?.temperature_2m;
  const weatherCode = weather.current?.weather_code;
  if (typeof temperature !== "number" || typeof weatherCode !== "number") {
    return NextResponse.json({ error: "Vädertjänsten returnerade ogiltig data." }, { status: 502 });
  }

  return NextResponse.json({
    temperature,
    description: weatherDescriptions[weatherCode] ?? "Okänt väder",
    icon: "",
    city: country.capital?.[0] ?? country.name.common,
  });
}
