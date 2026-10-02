import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { Layout } from '@/components/Layout';
import { absoluteUrl, DEFAULT_IMAGE, SITE_NAME, SITE_ORIGIN } from '@/utils/site';
import '@/styles/fonts.scss';
import '@/styles/global.scss';

const TITLE = 'Svadobný salón Jarka Galanta — svadobné a spoločenské šaty';
const DESCRIPTION =
    'Svadobné, spoločenské a prijímacie šaty, obleky pre ženíchov aj doplnky. Salón v Galante od roku 2007. Objednajte si termín skúšky.';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_ORIGIN),
    title: TITLE,
    description: DESCRIPTION,
    authors: [{ name: SITE_NAME }],
    icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
    other: { 'geo.region': 'SK-TA', 'geo.placename': 'Galanta' },
    openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        locale: 'sk_SK',
        title: TITLE,
        description: DESCRIPTION,
        images: [{ url: absoluteUrl(DEFAULT_IMAGE), alt: 'Nevesta vo svadobných šatách v salóne Jarka' }],
    },
    twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
    themeColor: '#fdfcfa',
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    preload('/fonts/jost-300-normal-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
    preload('/fonts/cormorant-garamond-400-normal-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });

    return (
        <html lang="sk" suppressHydrationWarning>
            <body>
                {/* Gates the scroll-reveal rules; without JS the sections simply stay visible. */}
                <Script id="js-flag" strategy="beforeInteractive">
                    {`document.documentElement.classList.add('js')`}
                </Script>
                <Layout>{children}</Layout>
            </body>
        </html>
    );
}
