import { prisma } from '../client';
import { Prisma, WebsiteStatus, Website } from '../client';
import { createLogger } from '@databuddy/logger';
// import { cacheable } from '@databuddy/redis';

const logger = createLogger('website-service');

type WebsiteWithUser = Website & {
  user: any;
};

export class WebsiteService {
  static async create(data: Prisma.WebsiteCreateInput) {
    try {
      return await prisma.website.create({ data });
    } catch (error) {
      logger.error('Failed to create website', { error });
      throw error;
    }
  }

  static findById = async (id: string): Promise<WebsiteWithUser | null> => {
    try {
      return await prisma.website.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find website', { error, id });
      throw error;
    }
  };

  static findByDomain = async (domain: string): Promise<WebsiteWithUser | null> => {
    try {
      return await prisma.website.findUnique({
        where: { domain },
        include: {
          user: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find website by domain', { error, domain });
      throw error;
    }
  };

  static findByUserId = async (userId: string): Promise<WebsiteWithUser[]> => {
    try {
      return await prisma.website.findMany({
        where: { userId },
        include: {
          user: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find websites by user', { error, userId });
      throw error;
    }
  };

  static async update(id: string, data: Prisma.WebsiteUpdateInput) {
    try {
      const website = await prisma.website.update({
        where: { id },
        data,
      });
      // Invalidate caches
      // await WebsiteService.findById.invalidate(id);
      // await WebsiteService.findByDomain.invalidate(website.domain);
      // await WebsiteService.findByUserId.invalidate(website.userId);
      return website;
    } catch (error) {
      logger.error('Failed to update website', { error, id });
      throw error;
    }
  }

  static async updateStatus(id: string, status: WebsiteStatus) {
    try {
      const website = await prisma.website.update({
        where: { id },
        data: { status },
      });
      // Invalidate caches
      // await WebsiteService.findById.invalidate(id);
      // await WebsiteService.findByDomain.invalidate(website.domain);
      // await WebsiteService.findByUserId.invalidate(website.userId);
      return website;
    } catch (error) {
      logger.error('Failed to update website status', { error, id });
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const website = await prisma.website.update({
        where: { id },
        data: { status: WebsiteStatus.INACTIVE },
      });
      // Invalidate caches
      // await WebsiteService.findById.invalidate(id);
      // await WebsiteService.findByDomain.invalidate(website.domain);
      // await WebsiteService.findByUserId.invalidate(website.userId);
      return website;
    } catch (error) {
      logger.error('Failed to delete website', { error, id });
      throw error;
    }
  }

  static async verifyDomain(id: string) {
    try {
      const website = await prisma.website.update({
        where: { id },
        data: { status: WebsiteStatus.ACTIVE },
      });
      // Invalidate caches
      // await WebsiteService.findById.invalidate(id);
      // await WebsiteService.findByDomain.invalidate(website.domain);
      // await WebsiteService.findByUserId.invalidate(website.userId);
      return website;
    } catch (error) {
      logger.error('Failed to verify website domain', { error, id });
      throw error;
    }
  }
} 