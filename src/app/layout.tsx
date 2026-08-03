import type { Metadata } from "next";
import { Montserrat, Oxanium, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";
import "./globals.css";

const montserratHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
});

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "IPL Lens",
    template: "%s | IPL Lens",
  },
  description:
    "IPL 2022 data analytics platform covering tournament standings, leaderboards, match scorecards, player profiles, wagon wheel spatial shots, and H2H matchups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        montserratHeading.variable,
        oxanium.variable,
        jetbrainsMono.variable,
        "h-full",
        "font-sans",
        "antialiased"
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
