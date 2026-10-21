import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Faculty Connect",
    template: "%s | Faculty Connect",
  },
  description:
    "Intelligent Academic Data Synchronization Platform — Enter Once, Use Everywhere. Faculty management, productivity, recognition and analytics for engineering departments.",
  keywords: ["faculty", "academic", "management", "productivity", "NBA", "NAAC"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ScrollProgress />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}