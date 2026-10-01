import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}