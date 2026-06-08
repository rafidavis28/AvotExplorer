import type { Metadata } from "next";
import { Cormorant, Spectral, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

// Display: high-contrast elegant serif for headings & references.
const cormorant = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Body: refined book serif for English prose.
const spectral = Spectral({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Hebrew: the classic Hebrew book typeface, excellent nikkud support.
const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Avot Explorer — A Map of the Ethics of the Fathers",
  description:
    "Explore Pirkei Avot as a constellation of teachings and themes, with Hebrew, English, and classical commentaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${spectral.variable} ${frankRuhl.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
