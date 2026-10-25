import { NextResponse } from "next/server";
import { getCountries } from "@/lib/countries";

export const revalidate = 86400;

export async function GET() {
  try {
    const countries = await getCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error("Kunde inte hämta landlistan från Rest Countries.", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Landlistan kunde inte hämtas från Rest Countries.",
      },
      { status: 502 },
    );
  }
}
