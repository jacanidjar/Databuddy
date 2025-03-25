import { prisma } from '../client';
import { Prisma, Contact } from '../client';
// import { cacheable } from '@databuddy/redis';
import { createLogger } from '@databuddy/logger';

const logger = createLogger('contact-service');

export class ContactService {
  static async create(data: Prisma.ContactCreateInput) {
    try {
      return await prisma.contact.create({ data });
    } catch (error) {
      logger.error('Failed to create contact', { error });
      throw error;
    }
  }

  static findById = /*cacheable(*/async (id: string): Promise<Contact | null> => {
    try {
      return await prisma.contact.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to find contact', { error, id });
      throw error;
    }
  }/*)*/;

  static findAll = /*cacheable(*/async (status?: string): Promise<Contact[]> => {
    try {
      return await prisma.contact.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find contacts', { error, status });
      throw error;
    }
  }/*)*/;

  static async update(id: string, data: Prisma.ContactUpdateInput) {
    try {
      const contact = await prisma.contact.update({
        where: { id },
        data,
      });
      // Invalidate caches
      // await ContactService.findById.invalidate(id);
      // await ContactService.findAll.invalidate();
      return contact;
    } catch (error) {
      logger.error('Failed to update contact', { error, id });
      throw error;
    }
  }

  static async markAsReplied(id: string) {
    try {
      const contact = await prisma.contact.update({
        where: { id },
        data: {
          status: 'replied',
          repliedAt: new Date(),
        },
      });
      // Invalidate caches
      // await ContactService.findById.invalidate(id);
      // await ContactService.findAll.invalidate();
      return contact;
    } catch (error) {
      logger.error('Failed to mark contact as replied', { error, id });
      throw error;
    }
  }

  static async markAsSpam(id: string) {
    try {
      const contact = await prisma.contact.update({
        where: { id },
        data: {
          status: 'spam',
        },
      });
      // Invalidate caches
      // await ContactService.findById.invalidate(id);
      // await ContactService.findAll.invalidate();
      return contact;
    } catch (error) {
      logger.error('Failed to mark contact as spam', { error, id });
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const contact = await prisma.contact.delete({
        where: { id },
      });
      // Invalidate caches
      // await ContactService.findById.invalidate(id);
      // await ContactService.findAll.invalidate();
      return contact;
    } catch (error) {
      logger.error('Failed to delete contact', { error, id });
      throw error;
    }
  }
} 