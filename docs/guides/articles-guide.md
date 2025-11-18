# Articles Directory

This directory contains all the MDX articles for your blog/articles section, organized by language.

## Directory Structure

```
articles/
├── en/                    # English articles
│   ├── getting-started.mdx
│   └── seo-best-practices.mdx
├── fr/                    # French articles
│   ├── demarrage.mdx
│   └── meilleures-pratiques-seo.mdx
└── README.md
```

## Creating a New Article

1. Navigate to the appropriate language folder (e.g., `en/` or `fr/`)
2. Create a new `.mdx` file (e.g., `my-article.mdx`)
3. Add frontmatter metadata at the top of the file:

```mdx
---
title: Your Article Title
description: A brief description of your article
date: 2025-10-30
author: Your Name
tags: ['tag1', 'tag2', 'tag3']
published: true
---

# Your Article Title

Your article content goes here...
```

## Frontmatter Fields

- **title** (required): The title of your article
- **description** (required): A brief description for SEO and article listing
- **date** (required): Publication date in YYYY-MM-DD format
- **author** (required): Author name
- **tags** (required): Array of tags for categorization
- **published** (required): Set to `true` to publish, `false` to hide

## MDX Features

You can use all standard Markdown syntax plus:

### Code Blocks

\`\`\`javascript
const hello = 'world';
console.log(hello);
\`\`\`

### Lists

- Bullet points
- Another point

1. Numbered lists
2. Another item

### Links

[Link text](https://example.com)

### Images

You can add images by placing them in the `public` folder and referencing them:

```mdx
![Alt text](/images/my-image.png)
```

## Adding a New Language

To add support for a new language:

1. Create a new directory with the language code (e.g., `es/` for Spanish)
2. Add your MDX articles to that directory
3. The system will automatically detect and include the new language

## How It Works

1. Articles are automatically discovered from language-specific directories
2. Only articles with `published: true` are displayed
3. Articles are sorted by date (newest first)
4. All published articles are automatically added to the sitemap with their language
5. Each article gets its own localized route: `/[locale]/articles/[slug]`

## Article Routes

- List all articles (English): `/en/articles`
- List all articles (French): `/fr/articles`
- Individual article (English): `/en/articles/getting-started`
- Individual article (French): `/fr/articles/demarrage`

## Sitemap Integration

The sitemap automatically includes:
- All article list pages by language (e.g., `/en/articles`, `/fr/articles`)
- All individual article pages with their language prefix
- Proper `lastModified` dates from article frontmatter
- SEO-optimized priorities (0.9 for lists, 0.8 for articles)
