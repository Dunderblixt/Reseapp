import { NextResponse } from "next/server";
import { getCountries } from "@/lib/countries";

export const revalidate = 86400;

// Returns the full country list.
export async function GET() {
  try {
    const countries = await getCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error("Could not fetch the country list from Rest Countries.", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not fetch the country list from Rest Countries.",
      },
      { status: 502 },
    );
  }
}
