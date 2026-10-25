import { cn } from "@/lib/utils";
import type { Country } from "@/lib/countries";

export function CountryFlag({
  country,
  className,
}: {
  country: Country;
  className?: string;
}) {
  const source = country.flags.svg || country.flags.png;

  if (source) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`Flagga: ${country.name.common}`}
        className={cn("inline-flex shrink-0 object-contain", className)}
        src={source}
      />
    );
  }

  return (
    <span
      aria-label={`Flagga: ${country.name.common}`}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      role="img"
    >
      {country.flag}
    </span>
  );
}
