# Quick Start Guide: Articles System

## 🚀 Your Articles System is Ready!

You now have a fully functional multi-language MDX blog with automatic SEO optimization!

## 📁 Structure

```
src/articles/
├── en/                    # English articles
│   ├── getting-started.mdx
│   └── seo-best-practices.mdx
└── fr/                    # French articles
    ├── demarrage.mdx
    └── meilleures-pratiques-seo.mdx
```

## ✍️ Add Your First Article

### 1. Create a new MDX file

```bash
# English article
touch src/articles/en/my-first-post.mdx

# French article
touch src/articles/fr/mon-premier-article.mdx
```

### 2. Add content with frontmatter

```mdx
---
title: My First Post
description: This is my first blog post
date: 2025-10-30
author: Your Name
tags: ['tutorial', 'getting-started']
published: true
---

# My First Post

Write your content here using Markdown!

## Subheading

- Bullet points work
- So do **bold** and *italic*
- Add [links](https://example.com)

\`\`\`javascript
// Code blocks too!
const greeting = 'Hello World';
\`\`\`
```

### 3. That's it!

Your article is automatically:
- ✅ Available at `/en/articles/my-first-post`
- ✅ Listed on `/en/articles`
- ✅ Added to `sitemap.xml`
- ✅ Pre-rendered at build time
- ✅ SEO optimized with meta tags

## 🌍 Multi-Language Support

### View Articles by Language

- English: http://localhost:3000/en/articles
- French: http://localhost:3000/fr/articles

### Add a New Language

```bash
# Create Spanish articles directory
mkdir src/articles/es

# Add your first Spanish article
touch src/articles/es/mi-primer-articulo.mdx
```

The system automatically detects and supports the new language!

## 🔍 SEO Features

### Automatic Sitemap

All articles are added to `/sitemap.xml`:
```
✓ /en/articles (priority: 0.9)
✓ /fr/articles (priority: 0.9)
✓ /en/articles/getting-started (priority: 0.8)
✓ /fr/articles/demarrage (priority: 0.8)
```

### Robots.txt

Already configured at `/robots.txt` pointing to your sitemap.

### Meta Tags

Each article automatically gets:
- Title and description meta tags
- Open Graph tags for social sharing
- Canonical URLs
- Article metadata (author, date, tags)

## 🛠️ Common Tasks

### Unpublish an Article

Set `published: false` in frontmatter:
```mdx
---
published: false
---
```

### Update Article Date

Change the date in frontmatter:
```mdx
---
date: 2025-11-01
---
```

### Add Tags

Add or modify tags array:
```mdx
---
tags: ['nextjs', 'react', 'tutorial', 'advanced']
---
```

## 🎨 Customization

### Style MDX Components

Edit `mdx-components.tsx` to customize:
- Headings
- Paragraphs
- Links
- Code blocks
- Lists
- And more!

### Add Images

Place images in `public/images/` and reference:
```mdx
![My Image](/images/my-photo.jpg)
```

## 📊 File Organization Tips

### Naming Convention

Use kebab-case for URLs:
```
✓ getting-started.mdx → /articles/getting-started
✓ seo-best-practices.mdx → /articles/seo-best-practices
✗ Getting Started.mdx (avoid spaces)
✗ SEO_Best_Practices.mdx (avoid underscores)
```

### Keep Content Organized

```
src/articles/
├── en/
│   ├── tutorials/          # Can create subdirs for organization
│   ├── guides/
│   └── news/
└── fr/
    ├── tutoriels/
    ├── guides/
    └── actualites/
```

Note: Currently flat structure is used, but you can organize files in subdirectories if you extend the utilities.

## 🚀 Deploy

### Build for Production

```bash
npm run build
```

All articles are pre-rendered as static pages!

### Start Production Server

```bash
npm run build
npm start
```

## 📚 Documentation Files

- `ARTICLES_SETUP.md` - Complete setup documentation
- `SITEMAP_STRUCTURE.md` - Sitemap details and SEO info
- `src/articles/README.md` - Detailed article creation guide

## ✨ What You Get

✅ **MDX Support** - Write in Markdown with React components
✅ **Multi-Language** - Full i18n support (en, fr, and easily add more)
✅ **SEO Optimized** - Automatic sitemap, meta tags, Open Graph
✅ **Static Generation** - Lightning-fast pre-rendered pages
✅ **Type Safe** - Full TypeScript support
✅ **Styled Components** - Beautiful default styling
✅ **Zero Config** - Just write MDX and go!

## 🎯 Next Steps

1. Delete example articles or use them as templates
2. Write your first article
3. Build and deploy
4. Submit sitemap to Google Search Console
5. Start writing more content!

Happy blogging! 📝
