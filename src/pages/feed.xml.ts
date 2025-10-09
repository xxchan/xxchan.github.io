import type { APIContext } from 'astro';
import { generateBlogFeed } from '../utils/rssFeed';

export async function GET(context: APIContext) {
  return generateBlogFeed(context);
}
