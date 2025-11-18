import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type ArticleMetadata = {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  published: boolean;
  slug: string;
  locale: string;
};

export type Article = {
  content: string;
} & ArticleMetadata;

const articlesDirectory = path.join(process.cwd(), 'src/articles');

export function getAllArticles(locale: string): ArticleMetadata[] {
  const localeDirectory = path.join(articlesDirectory, locale);

  // Check if locale directory exists
  if (!fs.existsSync(localeDirectory)) {
    return [];
  }

  // Get all MDX files from the locale-specific articles directory
  const fileNames = fs.readdirSync(localeDirectory);
  const articles = fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(localeDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        locale,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        tags: data.tags,
        published: data.published,
      } as ArticleMetadata;
    })
    .filter(article => article.published)
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

  return articles;
}

export function getAllArticlesAllLocales(): ArticleMetadata[] {
  const locales = getAvailableLocales();
  const allArticles: ArticleMetadata[] = [];

  for (const locale of locales) {
    allArticles.push(...getAllArticles(locale));
  }

  return allArticles;
}

export function getArticleBySlug(slug: string, locale: string): Article | null {
  try {
    const localeDirectory = path.join(articlesDirectory, locale);
    const fullPath = path.join(localeDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    if (!data.published) {
      return null;
    }

    return {
      slug,
      locale,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      tags: data.tags,
      published: data.published,
      content,
    };
  } catch {
    return null;
  }
}

export function getArticleSlugs(locale: string): string[] {
  const localeDirectory = path.join(articlesDirectory, locale);

  if (!fs.existsSync(localeDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(localeDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => fileName.replace(/\.mdx$/, ''));
}

export function getAvailableLocales(): string[] {
  try {
    const items = fs.readdirSync(articlesDirectory);
    return items.filter((item) => {
      const itemPath = path.join(articlesDirectory, item);
      return fs.statSync(itemPath).isDirectory();
    });
  } catch {
    return [];
  }
}
