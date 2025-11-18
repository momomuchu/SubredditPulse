import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles } from '@/utils/Articles';
import { getBaseUrl } from '@/utils/Helpers';

type ArticlesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata(
  props: ArticlesPageProps,
): Promise<Metadata> {
  const params = await props.params;
  return {
    title: 'Articles | Blog',
    description: 'Read our latest articles and tutorials',
    alternates: {
      canonical: `${getBaseUrl()}/${params.locale}/articles`,
    },
    openGraph: {
      title: 'Articles | Blog',
      description: 'Read our latest articles and tutorials',
      url: `${getBaseUrl()}/${params.locale}/articles`,
      type: 'website',
    },
  };
}

export default async function ArticlesPage(props: ArticlesPageProps) {
  const params = await props.params;
  const articles = getAllArticles(params.locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Articles</h1>

      {articles.length === 0
        ? (
            <p className="text-gray-600">No articles found.</p>
          )
        : (
            <div className="space-y-8">
              {articles.map(article => (
                <article
                  key={article.slug}
                  className="border-b border-gray-200 pb-8 last:border-0"
                >
                  <Link href={`/${params.locale}/articles/${article.slug}`} className="group">
                    <h2 className="mb-2 text-2xl font-semibold text-gray-900 group-hover:text-blue-600">
                      {article.title}
                    </h2>
                  </Link>

                  <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
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

                  <p className="mb-4 text-gray-700">{article.description}</p>

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
                </article>
              ))}
            </div>
          )}
    </div>
  );
}
