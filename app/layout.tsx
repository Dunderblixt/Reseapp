import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nordresa — find your next adventure",
  description:
    "Explore countries around the world, find travel inspiration, and check the current weather with Nordresa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          {children}
          <footer
            className="border-t border-stone-200 bg-white"
            id="om-nordresa"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <span className="font-display text-sm font-semibold text-emerald-950">nordresa.</span>
              <span>Explore the world, one country at a time. Data from Rest Countries, Open-Meteo, and Wikipedia.</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
