import type { Metadata } from "next";
import { Playfair_Display, Be_Vietnam_Pro, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "900"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NôngDana - Nông nghiệp 4.0",
  description: "Cây trong tầm tay - Mùa màng bội thu. Giải pháp toàn diện cho nông nghiệp hiện đại.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#2e8623',
  openGraph: {
    title: 'NôngDana - Nông nghiệp 4.0',
    description: 'Cây trong tầm tay - Mùa màng bội thu. Giải pháp toàn diện cho nông nghiệp hiện đại.',
    url: 'https://nongdana.vn',
    siteName: 'NôngDana',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NôngDana - Nông nghiệp 4.0',
    description: 'Cây trong tầm tay - Mùa màng bội thu. Giải pháp toàn diện cho nông nghiệp hiện đại.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  metadataBase: new URL('https://nongdana.vn'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${playfair.variable} ${beVietnam.variable} ${montserrat.variable} font-sans antialiased`}>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
        {children}
      </body>
    </html>
  );
}
