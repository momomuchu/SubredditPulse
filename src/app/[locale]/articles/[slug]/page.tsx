import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getArticleSlugs, getAvailableLocales } from '@/utils/Articles';
import { getBaseUrl } from '@/utils/Helpers';

type ArticlePageProps = {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
};

export async function generateStaticParams() {
  const locales = getAvailableLocales();
  const params: Array<{ slug: string; locale: string }> = [];

  for (const locale of locales) {
    const slugs = getArticleSlugs(locale);
    slugs.forEach((slug) => {
      params.push({ slug, locale });
    });
  }

  return params;
}

export async function generateMetadata(
  props: ArticlePageProps,
): Promise<Metadata> {
  const params = await props.params;
  const article = getArticleBySlug(params.slug, params.locale);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${getBaseUrl()}/${params.locale}/articles/${params.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${getBaseUrl()}/${params.locale}/articles/${params.slug}`,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
  };
}

export default async function ArticlePage(props: ArticlePageProps) {
  const params = await props.params;
  const article = getArticleBySlug(params.slug, params.locale);

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link
          href={`/${params.locale}/articles`}
          className="mb-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to Articles
        </Link>

        <h1 className="mb-4 text-4xl font-bold">{article.title}</h1>

        <div className="mb-4 flex items-center gap-4 text-gray-600">
          <time dateTime={article.date}>
            {new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>·</span>
          <span>{article.author}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <MDXRemote source={article.content} />
      </div>
    </article>
  );
}
