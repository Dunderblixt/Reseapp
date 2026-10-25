export interface WikipediaSummary {
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseImage(value: unknown) {
  if (
    !isRecord(value) ||
    typeof value.source !== "string" ||
    typeof value.width !== "number" ||
    typeof value.height !== "number"
  ) {
    return undefined;
  }

  return {
    source: value.source,
    width: value.width,
    height: value.height,
  };
}

function parseWikipediaSummary(value: unknown): WikipediaSummary | null {
  if (!isRecord(value)) return null;

  const contentUrls = isRecord(value.content_urls) ? value.content_urls : null;
  const desktop = contentUrls && isRecord(contentUrls.desktop)
    ? contentUrls.desktop
    : null;

  return {
    extract: typeof value.extract === "string" ? value.extract : undefined,
    thumbnail: parseImage(value.thumbnail),
    originalimage: parseImage(value.originalimage),
    content_urls:
      desktop && typeof desktop.page === "string"
        ? { desktop: { page: desktop.page } }
        : undefined,
  };
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

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    return null;
  }

  const summary = parseWikipediaSummary(result);
  return summary?.extract ? summary : null;
}
