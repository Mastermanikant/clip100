import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Frank Drop | Next-Gen P2P Transfer',
  description: 'Zero-friction cross-device P2P file and text transfer platform.',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans`}>
        {/* Anti-Ghosting Script to Clear Service Workers initially if needed */}
        <Script id="clear-sw" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.hostname === 'localhost') {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                }
              });
            }
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
