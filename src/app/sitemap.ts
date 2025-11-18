import type { MetadataRoute } from 'next';
import { getAllArticlesAllLocales, getAvailableLocales } from '@/utils/Articles';
import { getBaseUrl } from '@/utils/Helpers';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const articles = getAllArticlesAllLocales();
  const locales = getAvailableLocales();

  // Generate article list URLs for each locale
  const articleListUrls: MetadataRoute.Sitemap = locales.map(locale => ({
    url: `${baseUrl}/${locale}/articles`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Generate individual article URLs with locale
  const articleUrls: MetadataRoute.Sitemap = articles.map(article => ({
    url: `${baseUrl}/${article.locale}/articles/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...articleListUrls,
    ...articleUrls,
    // Add more URLs here
  ];
}
