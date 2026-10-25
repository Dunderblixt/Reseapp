export interface WikipediaSummary {
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
}

export async function getCountrySummary(
  countryName: string,
): Promise<WikipediaSummary | null> {
  const title = encodeURIComponent(countryName.replaceAll(" ", "_"));
  const response = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
    {
      headers: { "User-Agent": "Nordresa/1.0 (travel discovery app)" },
      next: { revalidate: 86400 },
    },
  );

  if (!response.ok) return null;

  const summary = (await response.json()) as WikipediaSummary;
  return summary.extract ? summary : null;
}
