import { prisma } from '../client';
import { Prisma, Client, ClientType } from '../client';
// import { createLogger } from '@databuddy/logger';
// import { cacheable } from '@databuddy/redis';

// const logger = createLogger('client-service');
const logger = console;

type ClientWithRelations = Client & {
  organization: any;
  projects: any[];
};

export class ClientService {
  static async create(data: Prisma.ClientCreateInput) {
    try {
      return await prisma.client.create({ data });
    } catch (error) {
      logger.error('Failed to create client', { error });
      throw error;
    }
  }

  static findById = async (id: string): Promise<ClientWithRelations | null> => {
    try {
      return await prisma.client.findUnique({
        where: { id },
        include: {
          organization: true,
          projects: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find client', { error, id });
      throw error;
    }
  };

  static findByOrganization = async (organizationId: string): Promise<ClientWithRelations[]> => {
    try {
      return await prisma.client.findMany({
        where: { organizationId },
        include: {
          organization: true,
          projects: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      logger.error('Failed to find clients by organization', { error, organizationId });
      throw error;
    }
  };

  static findByType = async (organizationId: string, type: ClientType): Promise<ClientWithRelations[]> => {
    try {
      return await prisma.client.findMany({
        where: { 
          organizationId,
          type
        },
        include: {
          organization: true,
          projects: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      logger.error('Failed to find clients by type', { error, organizationId, type });
      throw error;
    }
  };

  static async update(id: string, data: Prisma.ClientUpdateInput) {
    try {
      const client = await prisma.client.update({
        where: { id },
        data,
        include: {
          organization: true,
          projects: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      // Invalidate caches
      // await ClientService.findById.invalidate(id);
      // await ClientService.findByOrganization.invalidate(client.organizationId);
      // await ClientService.findByType.invalidate(client.organizationId, client.type);
      return client;
    } catch (error) {
      logger.error('Failed to update client', { error, id });
      throw error;
    }
  }

  static async updateType(id: string, type: ClientType) {
    try {
      const client = await prisma.client.update({
        where: { id },
        data: { type },
      });
      // Invalidate caches
      // await ClientService.findById.invalidate(id);
      // await ClientService.findByOrganization.invalidate(client.organizationId);
      // await ClientService.findByType.invalidate(client.organizationId, client.type);
      return client;
    } catch (error) {
      logger.error('Failed to update client type', { error, id });
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const client = await prisma.client.delete({
        where: { id },
      });
      // Invalidate caches
      // await ClientService.findById.invalidate(id);
      // await ClientService.findByOrganization.invalidate(client.organizationId);
      // await ClientService.findByType.invalidate(client.organizationId, client.type);
      return client;
    } catch (error) {
      logger.error('Failed to delete client', { error, id });
      throw error;
    }
  }

  static async search(organizationId: string, query: string): Promise<ClientWithRelations[]> {
    try {
      return await prisma.client.findMany({
        where: {
          organizationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          organization: true,
          projects: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      logger.error('Failed to search clients', { error, organizationId, query });
      throw error;
    }
  }
} 