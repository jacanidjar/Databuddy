import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ProjectService, ProjectType } from '@databuddy/db';
import { router, protectedProcedure } from '../trpc';

const projectCreateSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(ProjectType),
  organizationId: z.string().uuid(),
  clientId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const projectUpdateSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(ProjectType).optional(),
  clientId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.string().optional(),
});

export const projectRouter = router({
  // Create a new project
  create: protectedProcedure
    .input(projectCreateSchema)
    .mutation(async ({ input }) => {
      try {
        const project = await ProjectService.create({
          name: input.name,
          slug: input.slug,
          description: input.description,
          type: input.type,
          organization: {
            connect: { id: input.organizationId }
          },
          client: input.clientId ? {
            connect: { id: input.clientId }
          } : undefined,
          startDate: input.startDate,
          endDate: input.endDate,
        });
        return project;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create project',
          cause: error,
        });
      }
    }),

  // Get project by ID
  byId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const project = await ProjectService.findById(input);
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
      return project;
    }),

  // Get project by slug and organization
  bySlug: protectedProcedure
    .input(z.object({
      slug: z.string(),
      organizationId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const project = await ProjectService.findBySlug(input.slug, input.organizationId);
      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
      }
      return project;
    }),

  // List projects by organization
  byOrganization: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const projects = await ProjectService.findByOrganization(input);
        return projects;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list projects',
          cause: error,
        });
      }
    }),

  // List projects by client
  byClient: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      try {
        const projects = await ProjectService.findByClient(input);
        return projects;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list projects',
          cause: error,
        });
      }
    }),

  // Update project
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: projectUpdateSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        const updateData: any = { ...input.data };
        if (input.data.clientId) {
          updateData.client = { connect: { id: input.data.clientId } };
          delete updateData.clientId;
        }
        const project = await ProjectService.update(input.id, updateData);
        return project;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update project',
          cause: error,
        });
      }
    }),

  // Update project status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const project = await ProjectService.updateStatus(input.id, input.status);
        return project;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update project status',
          cause: error,
        });
      }
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      try {
        await ProjectService.delete(input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete project',
          cause: error,
        });
      }
    }),

  // Add project access
  addAccess: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      userId: z.string().uuid(),
      level: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
    }))
    .mutation(async ({ input }) => {
      try {
        await ProjectService.addAccess(input.projectId, {
          user: { connect: { id: input.userId } },
          project: { connect: { id: input.projectId } },
          level: input.level,
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add project access',
          cause: error,
        });
      }
    }),

  // Remove project access
  removeAccess: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      try {
        await ProjectService.removeAccess(input.projectId, input.userId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove project access',
          cause: error,
        });
      }
    }),

  // Add project event
  addEvent: protectedProcedure
    .input(z.object({
      projectId: z.string().uuid(),
      name: z.string(),
      description: z.string().optional(),
      data: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await ProjectService.addEvent(input.projectId, {
          name: input.name,
          description: input.description,
          data: input.data,
          project: { connect: { id: input.projectId } },
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add project event',
          cause: error,
        });
      }
    }),
}); 