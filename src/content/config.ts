import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    toc: z.boolean().optional(),
    tocLabel: z.string().optional(),
    tocSticky: z.boolean().optional(),
    lang: z.string().optional(),
    alternateSlug: z.string().optional(),
  }),
});

export const collections = { blog };
