import { prisma, User } from '../client';
import { Prisma, Member, Role } from '../client';
import { createLogger } from '@databuddy/logger';
// import { cacheable } from '@databuddy/redis';

const logger = createLogger('member-service');

type MemberWithRelations = Member & {
  organization: any;
  user: User;
};

export class MemberService {
  static async create(data: Prisma.MemberCreateInput) {
    try {
      return await prisma.member.create({
        data,
        include: {
          organization: true,
          user: true,
        },
      });
    } catch (error) {
      logger.error('Failed to create member', { error });
      throw error;
    }
  }

  static findById = /*cacheable(*/async (id: string): Promise<MemberWithRelations | null> => {
    try {
      return await prisma.member.findUnique({
        where: { id },
        include: {
          organization: true,
          user: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find member', { error, id });
      throw error;
    }
  }/*)*/;

  static findByOrganization = /*cacheable(*/async (organizationId: string): Promise<MemberWithRelations[]> => {
    try {
      return await prisma.member.findMany({
        where: { organizationId },
        include: {
          organization: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find members by organization', { error, organizationId });
      throw error;
    }
  }/*)*/;

  static findByUser = /*cacheable(*/async (userId: string): Promise<MemberWithRelations[]> => {
    try {
      return await prisma.member.findMany({
        where: { userId },
        include: {
          organization: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find members by user', { error, userId });
      throw error;
    }
  }/*)*/;

  static async updateRole(id: string, role: Role) {
    try {
      const member = await prisma.member.update({
        where: { id },
        data: { role },
        include: {
          organization: true,
          user: true,
        },
      });

      // Invalidate caches
      // await MemberService.findById.invalidate(id);
      // await MemberService.findByOrganization.invalidate(member.organizationId);
      // await MemberService.findByUser.invalidate(member.userId);

      return member;
    } catch (error) {
      logger.error('Failed to update member role', { error, id });
      throw error;
    }
  }

  static async remove(id: string) {
    try {
      const member = await prisma.member.delete({
        where: { id },
      });

      // Invalidate caches
      // await MemberService.findById.invalidate(id);
      // await MemberService.findByOrganization.invalidate(member.organizationId);
      // await MemberService.findByUser.invalidate(member.userId);

      return member;
    } catch (error) {
      logger.error('Failed to remove member', { error, id });
      throw error;
    }
  }

  static async findByOrganizationAndUser(organizationId: string, userId: string): Promise<MemberWithRelations | null> {
    try {
      return await prisma.member.findFirst({
        where: { 
          organizationId,
          userId,
        },
        include: {
          organization: true,
          user: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find member by organization and user', { error, organizationId, userId });
      throw error;
    }
  }

  static async hasRole(organizationId: string, userId: string, roles: Role[]): Promise<boolean> {
    try {
      const member = await MemberService.findByOrganizationAndUser(organizationId, userId);
      return member ? roles.includes(member.role as Role) : false;
    } catch (error) {
      logger.error('Failed to check member role', { error, organizationId, userId });
      throw error;
    }
  }
} 