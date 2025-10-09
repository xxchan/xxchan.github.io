import { getCollection } from 'astro:content';

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
