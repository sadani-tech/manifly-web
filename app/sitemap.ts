import type { MetadataRoute } from 'next';
import { publicConfig } from '@/lib/public-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/pricing', '/contact', '/legal/privacy', '/legal/terms', '/legal/refund', '/data-deletion'];
  return routes.map((route) => ({ url: `${publicConfig.siteUrl}${route}`, lastModified: new Date(), changeFrequency: route === '' || route === '/pricing' ? 'weekly' : 'monthly', priority: route === '' ? 1 : 0.7 }));
}
