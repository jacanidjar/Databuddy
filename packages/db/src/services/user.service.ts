import { prisma } from '../client';
import { Prisma, Role, UserStatus, User } from '../client';
import { createLogger } from '@databuddy/logger';
// import { cacheable } from '@databuddy/redis';

const logger = createLogger('user-service');

type UserWithRelations = User & {
  organizations: any[];
  memberships: any[];
  projectAccess: any[];
  websites: any[];
};

export class UserService {
  static async create(data: Omit<Prisma.UserCreateInput, 'emailVerified'> & { emailVerified: boolean }) {
    try {
      return await prisma.user.create({ 
        data: {
          ...data,
          emailVerified: data.emailVerified || false
        } 
      });
    } catch (error) {
      logger.error('Failed to create user', { error });
      throw error;
    }
  }

  static findById = async (id: string): Promise<UserWithRelations | null> => {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          organizations: true,
          memberships: true,
          projectAccess: true,
          websites: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find user', { error, id });
      throw error;
    }
  };

  static findByEmail = async (email: string): Promise<UserWithRelations | null> => {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          organizations: true,
          memberships: true,
          projectAccess: true,
          websites: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find user by email', { error, email });
      throw error;
    }
  };

  static async update(id: string, data: Omit<Prisma.UserUpdateInput, 'emailVerified'> & { emailVerified?: boolean }) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...data,
          emailVerified: data.emailVerified === undefined ? undefined : data.emailVerified
        },
      });
      // Invalidate cache
      // await UserService.findById.invalidate(id);
      // await UserService.findByEmail.invalidate(user.email);
      return user;
    } catch (error) {
      logger.error('Failed to update user', { error, id });
      throw error;
    }
  }

  static async updateStatus(id: string, status: UserStatus) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { status },
      });
      // await UserService.findById.invalidate(id);
      // await UserService.findByEmail.invalidate(user.email);
      return user;
    } catch (error) {
      logger.error('Failed to update user status', { error, id });
      throw error;
    }
  }

  static async updateRole(id: string, role: Role) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
      });
      // await UserService.findById.invalidate(id);
      // await UserService.findByEmail.invalidate(user.email);
      return user;
    } catch (error) {
      logger.error('Failed to update user role', { error, id });
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          status: UserStatus.INACTIVE
        },
      });
      // await UserService.findById.invalidate(id);
      // await UserService.findByEmail.invalidate(user.email);
      return user;
    } catch (error) {
      logger.error('Failed to delete user', { error, id });
      throw error;
    }
  }

  static async verifyEmail(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { emailVerified: true },
      });
      // await UserService.findById.invalidate(id);
      // await UserService.findByEmail.invalidate(user.email);
      return user;
    } catch (error) {
      logger.error('Failed to verify user email', { error, id });
      throw error;
    }
  }
} 