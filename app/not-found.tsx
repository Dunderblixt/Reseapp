import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Lost in the world?</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-emerald-950">Page not found</h1>
      <p className="mt-3 text-stone-600">We couldn’t find the page you’re looking for.</p>
      <Button asChild className="mt-6"><Link href="/">Back to home</Link></Button>
    </main>
  );
}
