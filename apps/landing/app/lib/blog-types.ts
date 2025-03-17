import { Post as DbPost, Category as DbCategory, Tag as DbTag, User as DbUser } from "@databuddy/db";

// Frontend-specific interfaces that extend the DB types with additional properties
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  categoryId: string | null;
  coverImage: string | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  author: BlogAuthor;
  readingTime?: number;
}

export interface BlogCategory extends DbCategory {
  postCount?: number;
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag extends DbTag {
  postCount?: number;
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

// Type transformers to convert DB types to frontend types
export function transformPost(post: DbPost & { 
  category?: DbCategory | null, 
  tags?: DbTag[], 
  author?: Pick<DbUser, 'id' | 'name'> | null 
}): BlogPost {
  return {
    ...post,
    coverImage: post.coverImage || null,
    categories: post.category ? [transformCategory(post.category)] : [],
    tags: post.tags ? post.tags.map(transformTag) : [],
    author: {
      id: post.authorId,
      name: post.author?.name || 'Anonymous',
      image: null
    }
  };
}

export function transformCategory(category: DbCategory & { _count?: { posts: number } }): BlogCategory {
  return {
    ...category,
    postCount: category._count?.posts || 0
  };
}

export function transformTag(tag: DbTag & { _count?: { posts: number } }): BlogTag {
  return {
    ...tag,
    postCount: tag._count?.posts || 0
  };
} 