import type { Metadata } from "next";
import { ClientLayout } from "@/components/ClientLayout";
import "./globals.css";
import { Outfit, Fira_Code } from "next/font/google";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/LanguageContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Safir Jameel Manghat | Portfolio",
    template: "%s | Safir Jameel Manghat"
  },
  description: "Full-Stack & Backend Developer Portfolio specializing in Next.js, PostgreSQL database optimization, and high-performance backend systems.",
  keywords: ["Safir Jameel Manghat", "Full-Stack Developer", "Backend Engineer", "Next.js", "PostgreSQL", "React", "Stockholm", "Software Developer"],
  authors: [{ name: "Safir Jameel Manghat" }],
  creator: "Safir Jameel Manghat",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://safir.dev",
    title: "Safir Jameel Manghat | Full-Stack & Backend Developer",
    description: "Full-Stack & Backend Developer Portfolio specializing in Next.js, PostgreSQL optimization, and event-driven architectures.",
    siteName: "Safir Jameel Manghat Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safir Jameel Manghat | Portfolio",
    description: "Full-Stack & Backend Developer Portfolio specializing in Next.js and PostgreSQL optimization.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable, firaCode.variable)}>
      <body>
        <LanguageProvider>
          <ClientLayout>{children}</ClientLayout>
        </LanguageProvider>
      </body>
    </html>
  );
}
