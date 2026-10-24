import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nordresa",
  description: "Discover your next destination with Nordresa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
