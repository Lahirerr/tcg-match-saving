import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "สมุดแมทช์ — บันทึกผล PTCG",
  description:
    "บันทึกผลการเล่น Pokémon TCG แต่ละเกม แล้วดูอัตราชนะของเด็คคุณ",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans antialiased [padding-top:env(safe-area-inset-top,0px)] [padding-bottom:env(safe-area-inset-bottom,0px)]">
        {children}
      </body>
    </html>
  );
}
