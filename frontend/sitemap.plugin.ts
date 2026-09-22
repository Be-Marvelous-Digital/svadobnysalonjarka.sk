import type { Plugin } from 'vite';
import { COLLECTIONS } from './src/data/collections.ts';
import { ROUTES } from './src/utils/routes.ts';

const ORIGIN = 'https://svadobnysalonjarka.sk';

/** Higher for the pages a bride actually lands on and books from. */
const PRIORITIES: Record<string, number> = {
    [ROUTES.home]: 1.0,
    [ROUTES.reservation]: 0.9,
    [ROUTES.prices]: 0.8,
    [ROUTES.contact]: 0.8,
    [ROUTES.about]: 0.7,
    [ROUTES.privacy]: 0.3,
    [ROUTES.terms]: 0.3,
};

const COLLECTION_PRIORITY: Record<string, number> = {
    svadobne: 0.9,
    spolocenske: 0.9,
    prijimacie: 0.8,
    zenich: 0.8,
    obuv: 0.7,
    galeria: 0.7,
};

function paths(): string[] {
    // Admin is the one route deliberately left out — robots.txt disallows it too.
    const pages = Object.entries(ROUTES)
        .filter(([name]) => name !== 'admin')
        .map(([, path]) => path);
    // COLLECTIONS, not every category: instagram, osalone and priestor fill a
    // strip or a page of their own and have no /kolekcia/ page behind them, so
    // listing them offered Google three URLs that answer with a noindex 404.
    return [...pages, ...COLLECTIONS.map((collection) => `/kolekcia/${collection.key}`)];
}

function render(lastmod: string): string {
    const urls = paths()
        .map((path) => {
            const priority = PRIORITIES[path] ?? COLLECTION_PRIORITY[path.replace('/kolekcia/', '')] ?? 0.5;
            return [
                '    <url>',
                `        <loc>${ORIGIN}${path === '/' ? '/' : path}</loc>`,
                `        <lastmod>${lastmod}</lastmod>`,
                `        <priority>${priority.toFixed(1)}</priority>`,
                '    </url>',
            ].join('\n');
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * Generates sitemap.xml from the router's own route table, so adding a page can
 * never leave the sitemap behind. Replaces any checked-in public/sitemap.xml.
 */
function today(): string {
    const source = process.env.SOURCE_DATE_EPOCH ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000) : new Date();
    return source.toISOString().slice(0, 10);
}

export function sitemapPlugin(): Plugin {
    return {
        name: 'jarka-sitemap',

        // Served in dev as well, so /sitemap.xml is not the SPA fallback locally
        // and the E2E suite checks the same document production ships.
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url?.split('?')[0] !== '/sitemap.xml') return next();
                res.setHeader('Content-Type', 'application/xml');
                res.end(render(today()));
            });
        },

        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: render(today()) });
        },
    };
}
