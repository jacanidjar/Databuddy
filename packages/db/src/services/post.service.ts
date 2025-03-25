import { prisma } from '../client';
import { Prisma, Post } from '../client';
// import { cacheable } from '@databuddy/redis';
import { createLogger } from '@databuddy/logger';

const logger = createLogger('post-service');

type PostWithRelations = Post & {
  author: any;
  category: any;
  tags: any[];
};

export class PostService {
  static async create(data: Prisma.PostCreateInput) {
    try {
      return await prisma.post.create({
        data,
        include: { author: true, category: true, tags: true },
      });
    } catch (error) {
      logger.error('Failed to create post', { error });
      throw error;
    }
  }

  static findById = /*cacheable(*/async (id: string): Promise<PostWithRelations | null> => {
    try {
      return await prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find post', { error, id });
      throw error;
    }
  }/*)*/;

  static findBySlug = /*cacheable(*/async (slug: string): Promise<PostWithRelations | null> => {
    try {
      return await prisma.post.findUnique({
        where: { slug },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find post by slug', { error, slug });
      throw error;
    }
  }/*)*/;

  static findByAuthorId = /*cacheable(*/async (authorId: string): Promise<PostWithRelations[]> => {
    try {
      return await prisma.post.findMany({
        where: { authorId },
        include: {
          author: true,
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find posts by author', { error, authorId });
      throw error;
    }
  }/*)*/;

  static findPublished = /*cacheable(*/async (): Promise<PostWithRelations[]> => {
    try {
      return await prisma.post.findMany({
        where: { published: true },
        include: {
          author: true,
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find published posts', { error });
      throw error;
    }
  }/*)*/;

  static async update(id: string, data: Prisma.PostUncheckedUpdateInput) {
    try {
      const post = await prisma.post.update({
        where: { id },
        data,
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      // Invalidate caches
      // await PostService.findById.invalidate(id);
      // await PostService.findBySlug.invalidate(post.slug);
      // await PostService.findByAuthorId.invalidate(post.authorId);
      // await PostService.findPublished.invalidate();
      return post;
    } catch (error) {
      logger.error('Failed to update post', { error, id });
      throw error;
    }
  }

  static async publish(id: string) {
    try {
      const post = await prisma.post.update({
        where: { id },
        data: { 
          published: true,
          publishedAt: new Date()
        },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      // Invalidate caches
      // await PostService.findById.invalidate(id);
      // await PostService.findBySlug.invalidate(post.slug);
      // await PostService.findByAuthorId.invalidate(post.authorId);
      // await PostService.findPublished.invalidate();
      return post;
    } catch (error) {
      logger.error('Failed to publish post', { error, id });
      throw error;
    }
  }

  static async unpublish(id: string) {
    try {
      const post = await prisma.post.update({
        where: { id },
        data: { 
          published: false,
          publishedAt: null
        },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      // Invalidate caches
      // await PostService.findById.invalidate(id);
      // await PostService.findBySlug.invalidate(post.slug);
      // await PostService.findByAuthorId.invalidate(post.authorId);
      // await PostService.findPublished.invalidate();
      return post;
    } catch (error) {
      logger.error('Failed to unpublish post', { error, id });
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const post = await prisma.post.delete({
        where: { id },
      });
      // Invalidate caches
      // await PostService.findById.invalidate(id);
      // await PostService.findBySlug.invalidate(post.slug);
      // await PostService.findByAuthorId.invalidate(post.authorId);
      // await PostService.findPublished.invalidate();
      return post;
    } catch (error) {
      logger.error('Failed to delete post', { error, id });
      throw error;
    }
  }
} 