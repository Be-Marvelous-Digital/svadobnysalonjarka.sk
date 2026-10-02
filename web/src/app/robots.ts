import type { MetadataRoute } from 'next';
import { ROUTES } from '@/utils/routes';
import { absoluteUrl } from '@/utils/site';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: '*', allow: '/', disallow: [ROUTES.admin, '/api/'] },
        sitemap: absoluteUrl('/sitemap.xml'),
    };
}
