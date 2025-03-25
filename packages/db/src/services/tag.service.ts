import { prisma } from '../client';
import { Prisma, Tag } from '../client';
// import { cacheable } from '@databuddy/redis';
import { createLogger } from '@databuddy/logger';

const logger = createLogger('tag-service');

type TagWithPosts = Tag & {
  posts: any[];
};

export class TagService {
  static async create(data: Prisma.TagCreateInput) {
    try {
      return await prisma.tag.create({ data });
    } catch (error) {
      logger.error('Failed to create tag', { error });
      throw error;
    }
  }

  static findById = /*cacheable(*/async (id: string): Promise<TagWithPosts | null> => {
    try {
      return await prisma.tag.findUnique({
        where: { id },
        include: {
          posts: {
            where: { 
              published: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find tag', { error, id });
      throw error;
    }
  }/*)*/;

  static findBySlug = /*cacheable(*/async (slug: string): Promise<TagWithPosts | null> => {
    try {
      return await prisma.tag.findUnique({
        where: { slug },
        include: {
          posts: {
            where: { 
              published: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find tag by slug', { error, slug });
      throw error;
    }
  }/*)*/;

  static findAll = /*cacheable(*/async (): Promise<TagWithPosts[]> => {
    try {
      return await prisma.tag.findMany({
        include: {
          posts: {
            where: { 
              published: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      logger.error('Failed to find all tags', { error });
      throw error;
    }
  }/*)*/;

  static async update(id: string, data: Prisma.TagUpdateInput) {
    try {
      const tag = await prisma.tag.update({
        where: { id },
        data,
        include: {
          posts: {
            where: { published: true },
            orderBy: { publishedAt: 'desc' },
          },
        },
      });
      // Invalidate caches
      // await TagService.findById.invalidate(id);
      // await TagService.findBySlug.invalidate(tag.slug);
      // await TagService.findAll.invalidate();
      return tag;
    } catch (error) {
      logger.error('Failed to update tag', { error, id });
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const tag = await prisma.tag.delete({
        where: { id },
      });
      // Invalidate caches
      // await TagService.findById.invalidate(id);
      // await TagService.findBySlug.invalidate(tag.slug);
      // await TagService.findAll.invalidate();
      return tag;
    } catch (error) {
      logger.error('Failed to delete tag', { error, id });
      throw error;
    }
  }

  static async connectPost(tagId: string, postId: string) {
    try {
      const tag = await prisma.tag.update({
        where: { id: tagId },
        data: {
          posts: {
            connect: { id: postId }
          }
        },
      });
      // Invalidate caches
      // await TagService.findById.invalidate(tagId);
      // await TagService.findBySlug.invalidate(tag.slug);
      // await TagService.findAll.invalidate();
      return tag;
    } catch (error) {
      logger.error('Failed to connect post to tag', { error, tagId, postId });
      throw error;
    }
  }

  static async disconnectPost(tagId: string, postId: string) {
    try {
      const tag = await prisma.tag.update({
        where: { id: tagId },
        data: {
          posts: {
            disconnect: { id: postId }
          }
        },
      });
      // Invalidate caches
      // await TagService.findById.invalidate(tagId);
      // await TagService.findBySlug.invalidate(tag.slug);
      // await TagService.findAll.invalidate();
      return tag;
    } catch (error) {
      logger.error('Failed to disconnect post from tag', { error, tagId, postId });
      throw error;
    }
  }
} 