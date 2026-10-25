import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nordresa — hitta ditt nästa äventyr",
  description:
    "Upptäck världens länder, hitta reseinspiration och se aktuellt väder med Nordresa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
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
              <span>Upptäck världen, ett land i taget. Data från Rest Countries, Open-Meteo och Wikipedia.</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
