"use client";

import { Heart } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveCountryButton({
  code,
  name,
  className,
}: {
  code: string;
  name: string;
  className?: string;
}) {
  const { isSaved, toggleSavedCountry } = useAppContext();
  const saved = isSaved(code);

  return (
    <Button
      aria-label={
        saved ? `Remove ${name} from saved countries` : `Save ${name}`
      }
      aria-pressed={saved}
      className={cn(
        className,
        saved ? "text-rose-400 hover:text-rose-300" : "",
      )}
      onClick={() => toggleSavedCountry(code)}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Heart aria-hidden="true" size={19} fill={saved ? "currentColor" : "none"} />
    </Button>
  );
}
