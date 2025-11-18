# Articles System Setup

Your Next.js app now has a complete MDX-based articles/blog system with full SEO support!

## What Was Added

### 1. Dependencies Installed
- `@next/mdx` - Next.js MDX integration
- `@mdx-js/loader` - MDX loader for webpack
- `@mdx-js/react` - React components for MDX
- `@types/mdx` - TypeScript types for MDX
- `gray-matter` - Parse frontmatter from MDX files
- `next-mdx-remote` - Render MDX content remotely

### 2. Configuration Files

#### `next.config.ts`
- Added MDX support with `@next/mdx`
- Configured page extensions to include `.mdx` files

#### `mdx-components.tsx`
- Custom styled components for MDX content
- Includes styling for headings, paragraphs, lists, links, code blocks, etc.

### 3. Directory Structure

```
src/
├── articles/                      # Your MDX articles organized by language
│   ├── en/                       # English articles
│   │   ├── getting-started.mdx
│   │   └── seo-best-practices.mdx
│   ├── fr/                       # French articles
│   │   ├── demarrage.mdx
│   │   └── meilleures-pratiques-seo.mdx
│   └── README.md                 # Documentation for creating articles
│
├── utils/
│   └── Articles.ts               # Utility functions for article management
│
└── app/
    ├── [locale]/
    │   └── articles/
    │       ├── page.tsx          # Articles list page (language-aware)
    │       └── [slug]/
    │           └── page.tsx      # Individual article page (language-aware)
    ├── sitemap.ts                # Updated with language-specific article URLs
    └── robots.ts                 # Already configured
```

### 4. Features Implemented

✅ **MDX Support** - Write articles using MDX (Markdown + JSX)
✅ **Frontmatter Metadata** - Title, description, date, author, tags, published status
✅ **Multi-Language Support** - Articles organized by language (en, fr, etc.)
✅ **Article Listing** - Automatic list of all published articles at `/[locale]/articles`
✅ **Individual Article Pages** - Dynamic routes for each article at `/[locale]/articles/[slug]`
✅ **SEO Optimization**
  - Meta tags (title, description)
  - Open Graph tags for social sharing
  - Language-specific canonical URLs
  - Automatic sitemap generation with language prefixes
  - Robots.txt already configured
✅ **Static Generation** - Articles are pre-rendered at build time
✅ **Full Internationalization** - Seamlessly integrates with your existing i18n setup

## How to Use

### Creating a New Article

1. Navigate to the language folder and create a new `.mdx` file:

```bash
# For English article
touch src/articles/en/my-new-article.mdx

# For French article
touch src/articles/fr/mon-nouvel-article.mdx
```

2. Add frontmatter and content:

```mdx
---
title: My Amazing Article
description: This article will teach you something awesome
date: 2025-10-30
author: Your Name
tags: ['tutorial', 'nextjs', 'mdx']
published: true
---

# My Amazing Article

Your content goes here! You can use:

## Markdown Features

- Lists
- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks
- And more!

\`\`\`javascript
const code = 'example';
\`\`\`
```

3. The article will automatically appear on your site!

### Article URLs

The URLs are language-aware and follow your i18n routing:

- English articles list: `http://localhost:3000/en/articles`
- French articles list: `http://localhost:3000/fr/articles`
- English article: `http://localhost:3000/en/articles/getting-started`
- French article: `http://localhost:3000/fr/articles/demarrage`

### Adding a New Language

To add support for a new language (e.g., Spanish):

1. Create a new directory: `mkdir src/articles/es`
2. Add your MDX articles to that directory
3. The system will automatically detect and include the new language in:
   - Article routes
   - Sitemap generation
   - Static generation

### Unpublishing an Article

Set `published: false` in the frontmatter to hide an article without deleting it.

## SEO Benefits

### Sitemap
All published articles are automatically added to `/sitemap.xml`:
- Articles list page (priority: 0.9)
- Individual articles (priority: 0.8)
- Sorted by publication date

### Robots.txt
Already configured at `/robots.txt` and points to your sitemap.

### Meta Tags
Each article page includes:
- Title and description meta tags
- Open Graph tags for social media
- Canonical URLs
- Article metadata (author, publish date, tags)

## Routes Created

- `/[locale]/articles` - List all articles for specific language
  - `/en/articles` - English articles
  - `/fr/articles` - French articles
- `/[locale]/articles/[slug]` - Individual article view
  - `/en/articles/getting-started`
  - `/en/articles/seo-best-practices`
  - `/fr/articles/demarrage`
  - `/fr/articles/meilleures-pratiques-seo`

## Build Verification

The build was tested and shows all language-specific routes are working:
```
├ ● /[locale]/articles
│ ├ /en/articles
│ └ /fr/articles
├ ● /[locale]/articles/[slug]
│ ├ /en/articles/getting-started
│ ├ /en/articles/seo-best-practices
│ ├ /fr/articles/demarrage
│ └ /fr/articles/meilleures-pratiques-seo
└ ○ /sitemap.xml
```

The sitemap includes all language-specific article URLs with proper locale prefixes.

## Customization

### Styling
Edit `mdx-components.tsx` to customize how MDX elements are rendered.

### Article Utilities
Check `src/utils/Articles.ts` for functions like:
- `getAllArticles(locale)` - Get all published articles for a specific language
- `getAllArticlesAllLocales()` - Get all articles across all languages
- `getArticleBySlug(slug, locale)` - Get a specific article in a specific language
- `getArticleSlugs(locale)` - Get all article slugs for a specific language
- `getAvailableLocales()` - Get list of all available language directories

### Adding More Features
You can easily add:
- Article categories/filtering
- Search functionality
- Related articles
- Comments
- Share buttons
- Reading time estimation

## Example Articles Included

Four example articles are included to help you get started:

**English (en/):**
1. `getting-started.mdx` - Introduction to Next.js
2. `seo-best-practices.mdx` - SEO techniques

**French (fr/):**
1. `demarrage.mdx` - Introduction à Next.js
2. `meilleures-pratiques-seo.mdx` - Techniques de SEO

Feel free to delete or modify these examples!

## Next Steps

1. Write your first article in `src/articles/`
2. Run `npm run dev` to preview
3. Build with `npm run build` to generate static pages
4. Deploy and your articles will be indexed by search engines!

Happy writing! 📝
