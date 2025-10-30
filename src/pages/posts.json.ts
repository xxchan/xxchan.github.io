import { getCollection } from 'astro:content';
import { buildPostUrl } from '../utils/i18n';

export async function GET() {
  const posts = await getCollection('blog');
  return new Response(
    JSON.stringify(
      {
        items: posts.map((post) => ({
          slug: post.slug,
          title: post.data.title,
          tags: post.data.tags,
          categories: post.data.categories,
          locale: post.data.locale,
          url: buildPostUrl(post),
        })),
      },
      null,
      2,
    ),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    },
  );
}
