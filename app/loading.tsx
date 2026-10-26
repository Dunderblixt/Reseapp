import { LoaderCircle } from "lucide-react";

// Route-level loading state.
export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="flex min-h-[65vh] items-center justify-center bg-[#faf9f5] px-5"
    >
      <p
        className="flex items-center gap-3 text-sm font-medium text-emerald-900"
        role="status"
      >
        <LoaderCircle aria-hidden="true" className="animate-spin" size={22} />
        Loading...
      </p>
    </main>
  );
}
