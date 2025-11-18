# Sitemap Structure

Your sitemap is automatically generated with full multi-language support for articles!

## Sitemap URL

Your sitemap is available at: `/sitemap.xml`

## What's Included in the Sitemap

### 1. Homepage
- URL: `https://yoursite.com/`
- Priority: 1.0
- Change Frequency: daily

### 2. Article List Pages (by Language)
- English: `https://yoursite.com/en/articles`
- French: `https://yoursite.com/fr/articles`
- Priority: 0.9
- Change Frequency: daily

### 3. Individual Articles (by Language)
Each article is included with its language prefix:

**English Articles:**
- `https://yoursite.com/en/articles/getting-started`
- `https://yoursite.com/en/articles/seo-best-practices`

**French Articles:**
- `https://yoursite.com/fr/articles/demarrage`
- `https://yoursite.com/fr/articles/meilleures-pratiques-seo`

Priority: 0.8
Change Frequency: monthly
Last Modified: Uses the article's publication date

## How It Works

The sitemap is generated dynamically by:

1. **Scanning all language directories** in `src/articles/`
2. **Reading all MDX files** from each language folder
3. **Extracting metadata** from frontmatter (title, date, etc.)
4. **Filtering published articles** (only `published: true` are included)
5. **Generating language-specific URLs** for each article

## Robots.txt Integration

Your `robots.txt` file automatically points to the sitemap:

```txt
User-agent: *
Allow: /
Disallow: /dashboard
Sitemap: https://yoursite.com/sitemap.xml
```

## SEO Benefits

### Multi-Language SEO
- Search engines can discover content in all languages
- Each language version has its own URL structure
- Proper language attribution for search results

### Fresh Content Signals
- `lastModified` dates from article frontmatter
- Change frequencies optimize crawl priorities
- Priority values guide search engines to important content

### Automatic Updates
- New articles are automatically added to sitemap
- No manual sitemap maintenance required
- Works seamlessly with static site generation

## Viewing Your Sitemap

To view your sitemap:

1. **In development:**
   ```bash
   npm run dev
   ```
   Visit: `http://localhost:3000/sitemap.xml`

2. **In production:**
   After deploying, visit: `https://yoursite.com/sitemap.xml`

## Example Sitemap Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yoursite.com/</loc>
    <lastmod>2025-10-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yoursite.com/en/articles</loc>
    <lastmod>2025-10-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yoursite.com/fr/articles</loc>
    <lastmod>2025-10-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yoursite.com/en/articles/getting-started</loc>
    <lastmod>2025-10-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yoursite.com/fr/articles/demarrage</loc>
    <lastmod>2025-10-30</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Submitting Your Sitemap to Search Engines

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add your property
3. Go to "Sitemaps" in the left menu
4. Submit: `https://yoursite.com/sitemap.xml`

### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Submit sitemap: `https://yoursite.com/sitemap.xml`

## Adding More Content to Sitemap

To add other pages to your sitemap, edit `src/app/sitemap.ts`:

```typescript
return [
  // ... existing entries
  {
    url: `${baseUrl}/your-page`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
];
```

## Monitoring

Monitor your sitemap coverage in:
- Google Search Console → Sitemaps
- Check for indexing errors
- View which URLs are indexed
- Track crawl statistics
