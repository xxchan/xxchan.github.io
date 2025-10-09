import type { APIContext } from 'astro';
import { generateBlogFeed } from '../utils/atomFeed';

export async function GET(context: APIContext) {
  return generateBlogFeed(context);
}
