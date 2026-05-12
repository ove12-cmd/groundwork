import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import ConditionalNav from "@/components/ConditionalNav";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Groundwork — Wellness",
  description: "Your personalized wellness journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} h-full`}>
      <body className="h-full">
        {/*
          ConditionalNav is intentionally OUTSIDE page-enter.
          page-enter uses a transform animation which creates a stacking context
          that traps position:fixed children — rendering them relative to the
          animated container instead of the viewport. Placing the nav here
          keeps it truly fixed to the viewport at all times.
        */}
        <ConditionalNav />
        <div className="page-enter h-full">{children}</div>
      </body>
    </html>
  );
}
