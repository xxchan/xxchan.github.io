import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

function sortPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export async function generateBlogFeed(context: APIContext) {
  if (!context.site) {
    throw new Error('RSS feed requires `site` configuration.');
  }

  const posts = await getCollection('blog');
  const sortedPosts = sortPostsByDate(posts);
  const items = sortedPosts.map((post) => ({
    title: post.data.title,
    description: post.data.description ?? post.data.excerpt,
    pubDate: post.data.pubDate,
    link: `/blog/${post.slug}/`,
    categories: post.data.tags,
  }));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items,
  });
}
