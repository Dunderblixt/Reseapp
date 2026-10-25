import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Explore countries | Nordresa",
  description: "Discover countries around the world with Nordresa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
