import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { UserService } from '@databuddy/db';
import { router, protectedProcedure, adminProcedure } from '../trpc';

const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  role: z.enum(['ADMIN', 'USER', 'AUTHOR', 'EDITOR', 'VIEWER', 'OWNER']).optional(),
});

export const userRouter = router({
  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await UserService.findById(ctx.user.id);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return user;
  }),

  // Get user by ID (admin only)
  byId: adminProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const user = await UserService.findById(input);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return user;
    }),

  // Update current user
  update: protectedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedUser = await UserService.update(ctx.user.id, input);
        return updatedUser;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
          cause: error,
        });
      }
    }),

  // Update any user (admin only)
  updateUser: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: userUpdateSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        const updatedUser = await UserService.update(input.id, input.data);
        return updatedUser;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
          cause: error,
        });
      }
    }),

  // Delete user (admin only)
  delete: adminProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      try {
        await UserService.delete(input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
          cause: error,
        });
      }
    }),

  // List users (admin only)
//   list: adminProcedure.query(async () => {
//     try {
//       const users = await UserService.findAll();
//       return users;
//     } catch (error) {
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to list users',
//         cause: error,
//       });
//     }
//   }),
}); 