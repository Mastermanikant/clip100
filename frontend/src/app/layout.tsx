import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Frank Drop | Next-Gen P2P Transfer',
  description:
    'Zero-friction cross-device file and text transfer. Instant, encrypted, peer-to-peer.',
  openGraph: {
    title: 'Frank Drop | Next-Gen P2P Transfer',
    description: 'Zero-friction cross-device file and text transfer.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {/* Clear stale service workers from previous deployments */}
        <Script id="clear-sw" strategy="beforeInteractive">
          {`
            if ('serviceWorker' in navigator) {
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
