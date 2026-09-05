import type { Metadata } from 'next';
import './globals.css';
import { EOCProvider } from '@/context/EOCContext';

export const metadata: Metadata = {
  title: 'NER LandslideGuard — AI-Based Landslide Risk & Early Warning Platform',
  description: 'Operational Disaster Management & Early Warning GIS Platform for the North Eastern Region of India (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim).',
  icons: {
    icon: '/favicon.ico',
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
        <EOCProvider>
          {children}
        </EOCProvider>
      </body>
    </html>
  );
}
