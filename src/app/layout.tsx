import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { EOCProvider } from '@/context/EOCContext';
import { I18nProvider } from '@/context/I18nContext';
import { PWARegister } from '@/components/pwa/PWARegister';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'NER LandslideGuard — AI-Based Landslide Risk & Early Warning Platform',
  description: 'Operational Disaster Management & Early Warning GIS Platform for the North Eastern Region of India (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim).',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-eoc-bg text-eoc-text min-h-screen antialiased selection:bg-eoc-accent selection:text-white">
        <AuthProvider>
          <I18nProvider>
            <EOCProvider>
              <PWARegister />
              {children}
            </EOCProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
