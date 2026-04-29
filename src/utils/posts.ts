import type { CollectionEntry } from 'astro:content';

export function blogSlug(post: CollectionEntry<'blog'>) {
  return post.id.replace(/\.mdx?$/, '');
}
