import { prisma } from '../client';
import { Prisma, Category } from '../client';
// import { cacheable } from '@databuddy/redis';
import { createLogger } from '@databuddy/logger';

const logger = createLogger('category-service');

type CategoryWithPosts = Category & {
  posts: any[];
};

export class CategoryService {
  static async create(data: Prisma.CategoryCreateInput) {
    try {
      return await prisma.category.create({ data });
    } catch (error) {
      logger.error('Failed to create category', { error });
      throw error;
    }
  }

  static findById = /*cacheable(*/async (id: string): Promise<CategoryWithPosts | null> => {
    try {
      return await prisma.category.findUnique({
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
      logger.error('Failed to find category', { error, id });
      throw error;
    }
  }/*)*/;

  static findBySlug = /*cacheable(*/async (slug: string): Promise<CategoryWithPosts | null> => {
    try {
      return await prisma.category.findUnique({
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
      logger.error('Failed to find category by slug', { error, slug });
      throw error;
    }
  }/*)*/;

  static findAll = /*cacheable(*/async (): Promise<CategoryWithPosts[]> => {
    try {
      return await prisma.category.findMany({
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
      logger.error('Failed to find all categories', { error });
      throw error;
    }
  }/*)*/;

  static async update(id: string, data: Prisma.CategoryUpdateInput) {
    try {
      const category = await prisma.category.update({
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
      // await CategoryService.findById.invalidate(id);
      // await CategoryService.findBySlug.invalidate(category.slug);
      // await CategoryService.findAll.invalidate();
      return category;
    } catch (error) {
      logger.error('Failed to update category', { error, id });
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const category = await prisma.category.delete({
        where: { id },
      });
      // Invalidate caches
      // await CategoryService.findById.invalidate(id);
      // await CategoryService.findBySlug.invalidate(category.slug);
      // await CategoryService.findAll.invalidate();
      return category;
    } catch (error) {
      logger.error('Failed to delete category', { error, id });
      throw error;
    }
  }
} 