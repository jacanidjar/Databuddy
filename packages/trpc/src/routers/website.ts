import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { WebsiteService, WebsiteStatus } from '@databuddy/db';
import { router, protectedProcedure } from '../trpc';

const websiteCreateSchema = z.object({
  domain: z.string().url(),
});

const websiteUpdateSchema = z.object({
  domain: z.string().url().optional(),
  status: z.nativeEnum(WebsiteStatus).optional(),
});

export const websiteRouter = router({
  // Create a new website
  create: protectedProcedure
    .input(websiteCreateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const website = await WebsiteService.create({
          domain: input.domain,
          user: {
            connect: { id: ctx.user.id }
          },
        });
        return website;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create website',
          cause: error,
        });
      }
    }),

  // Get website by ID
  byId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const website = await WebsiteService.findById(input);
      if (!website) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Website not found' });
      }
      return website;
    }),

  // Get website by domain
  byDomain: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const website = await WebsiteService.findByDomain(input);
      if (!website) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Website not found' });
      }
      return website;
    }),

  // List websites by user
  list: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const websites = await WebsiteService.findByUserId(ctx.user.id);
        return websites;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list websites',
          cause: error,
        });
      }
    }),

  // Update website
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: websiteUpdateSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        const website = await WebsiteService.update(input.id, input.data);
        return website;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update website',
          cause: error,
        });
      }
    }),

  // Delete website
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      try {
        await WebsiteService.delete(input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete website',
          cause: error,
        });
      }
    }),
}); 