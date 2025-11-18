# SEO Documentation

Search engine optimization and discoverability documentation.

## Available Documentation

### [Sitemap Structure](./SITEMAP_STRUCTURE.md)
Understanding and managing your sitemap for optimal SEO.

**What's covered:**
- Sitemap URL and access
- What's included (homepage, articles, pages)
- Multi-language SEO
- How it works (automatic generation)
- Robots.txt integration
- Submitting to search engines
- Monitoring coverage

**Perfect for:** Optimizing your site for search engines

## SEO Features

### Automatic Sitemap
- ✅ Automatically generated at `/sitemap.xml`
- ✅ Multi-language support
- ✅ Dynamic article inclusion
- ✅ Priority and change frequency settings
- ✅ Last modified dates from frontmatter

### Meta Tags
- ✅ Title and description
- ✅ Open Graph tags
- ✅ Canonical URLs
- ✅ Language tags
- ✅ Article metadata

### Robots.txt
- ✅ Pre-configured
- ✅ Points to sitemap
- ✅ Allows search engines
- ✅ Blocks sensitive routes

### Structured Data
- ✅ JSON-LD support ready
- ✅ Article schema
- ✅ Organization schema
- ✅ Breadcrumbs

## SEO Best Practices

### Content Optimization
1. **Write quality content** - Focus on user value
2. **Use descriptive titles** - Clear, concise, keyword-rich
3. **Meta descriptions** - Compelling summaries (150-160 chars)
4. **Header hierarchy** - Proper H1, H2, H3 usage
5. **Internal linking** - Link to related content

### Technical SEO
1. **Fast loading** - Optimize images, use static generation
2. **Mobile-friendly** - Responsive design
3. **Clean URLs** - Descriptive, hierarchical structure
4. **HTTPS** - Secure connections
5. **Sitemap** - Keep updated and submit to search engines

### Multi-Language SEO
1. **Hreflang tags** - Indicate language versions
2. **Language-specific URLs** - Clear locale indicators
3. **Localized content** - Not just translations
4. **Country targeting** - Use Search Console
5. **Local hosting** - Consider CDN

## Search Engine Submission

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add your property
3. Verify ownership
4. Submit sitemap: `https://yoursite.com/sitemap.xml`
5. Monitor indexing and performance

### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Verify ownership
4. Submit sitemap
5. Track analytics

## Monitoring & Analytics

### What to Monitor
- **Indexing status** - Are pages being crawled?
- **Search performance** - Clicks, impressions, CTR
- **Core Web Vitals** - Page experience metrics
- **Mobile usability** - Mobile-friendly issues
- **Security issues** - Malware, hacking
- **Manual actions** - Penalties

### Tools
- Google Search Console
- Google Analytics
- Bing Webmaster Tools
- Lighthouse
- PageSpeed Insights

## Common SEO Tasks

### Submit New Content
1. Publish article with `published: true`
2. Build site (sitemap auto-updates)
3. Deploy
4. Request indexing in Search Console (optional)

### Update Meta Tags
1. Edit frontmatter in MDX files
2. Update metadata in page components
3. Build and deploy

### Check Indexing
1. Open Google Search Console
2. Go to Coverage report
3. View indexed pages
4. Check for errors

## Related Documentation

- [Sitemap Structure](./SITEMAP_STRUCTURE.md) - Detailed sitemap docs
- [Articles Guide](../guides/articles-guide.md) - Content creation
- [Features](../features/ARTICLES_SETUP.md) - Technical setup

## SEO Checklist

Before launching:
- [ ] Sitemap submitted to Google & Bing
- [ ] Meta descriptions on all pages
- [ ] Open Graph images configured
- [ ] Mobile-friendly test passed
- [ ] Core Web Vitals optimized
- [ ] HTTPS enabled
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Language tags for i18n
- [ ] Analytics connected

## Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
