import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import './globals.css';
import { createMetadata, organizationJsonLd } from "@/lib/seo";
import { Providers } from "@/components/providers";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['400','500','600','700','800'], variable: '--font-display' });

export const metadata: Metadata = createMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-screen bg-black font-sans text-white antialiased">
        <Providers>
          <AnnouncementBar />
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </Providers>
        <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      </body>
    </html>
  );
}
