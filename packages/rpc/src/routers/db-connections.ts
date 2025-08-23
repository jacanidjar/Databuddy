import { websitesApi } from '@databuddy/auth';
import { and, dbConnections, eq, isNull } from '@databuddy/db';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { createReadonlyUser, testConnection } from '../database';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { authorizeDbConnectionAccess } from '../utils/auth';
import { encryptConnectionUrl } from '../utils/encryption';

const createDbConnectionSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.string().default('postgres'),
	url: z.string().url('Must be a valid connection URL'),
	organizationId: z.string().optional(),
});

const updateDbConnectionSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'Name is required').optional(),
});

const buildDbConnectionFilter = (userId: string, organizationId?: string) =>
	organizationId
		? eq(dbConnections.organizationId, organizationId)
		: and(
				eq(dbConnections.userId, userId),
				isNull(dbConnections.organizationId)
			);

export const dbConnectionsRouter = createTRPCRouter({
	list: protectedProcedure
		.input(z.object({ organizationId: z.string().optional() }).default({}))
		.query(async ({ ctx, input }) => {
			if (input.organizationId) {
				const { success } = await websitesApi.hasPermission({
					headers: ctx.headers,
					body: { permissions: { website: ['read'] } },
				});
				if (!success) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Missing organization permissions.',
					});
				}
			}

			const whereClause = buildDbConnectionFilter(
				ctx.user.id,
				input.organizationId
			);

			const connections = await ctx.db.query.dbConnections.findMany({
				where: whereClause,
				columns: {
					id: true,
					name: true,
					type: true,
					userId: true,
					organizationId: true,
					createdAt: true,
					updatedAt: true,
				},
				orderBy: (table, { desc }) => [desc(table.createdAt)],
			});

			return connections;
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const connection = await ctx.db.query.dbConnections.findFirst({
				where: eq(dbConnections.id, input.id),
				columns: {
					id: true,
					name: true,
					type: true,
					userId: true,
					organizationId: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			if (!connection) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Connection not found',
				});
			}

			// Check access permissions
			if (connection.organizationId) {
				const { success } = await websitesApi.hasPermission({
					headers: ctx.headers,
					body: { permissions: { website: ['read'] } },
				});
				if (!success) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Missing organization permissions.',
					});
				}
			} else if (connection.userId !== ctx.user.id) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Access denied',
				});
			}

			return connection;
		}),

	create: protectedProcedure
		.input(createDbConnectionSchema)
		.mutation(async ({ ctx, input }) => {
			if (input.organizationId) {
				const { success } = await websitesApi.hasPermission({
					headers: ctx.headers,
					body: { permissions: { website: ['create'] } },
				});
				if (!success) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Missing organization permissions.',
					});
				}
			}

			try {
				await testConnection(input.url);
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Failed to connect to database: ${error.message}`,
				});
			}

			let readonlyUrl: string;
			try {
				const { readonlyUrl: readonly } = await createReadonlyUser(input.url);
				readonlyUrl = readonly;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Failed to create readonly user: ${error.message}`,
				});
			}

			const [connection] = await ctx.db
				.insert(dbConnections)
				.values({
					id: nanoid(),
					userId: ctx.user.id,
					name: input.name,
					type: input.type,
					url: encryptConnectionUrl(readonlyUrl),
					organizationId: input.organizationId,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
				.returning({
					id: dbConnections.id,
					name: dbConnections.name,
					type: dbConnections.type,
					userId: dbConnections.userId,
					organizationId: dbConnections.organizationId,
					createdAt: dbConnections.createdAt,
					updatedAt: dbConnections.updatedAt,
				});

			return connection;
		}),

	update: protectedProcedure
		.input(updateDbConnectionSchema)
		.mutation(async ({ ctx, input }) => {
			await authorizeDbConnectionAccess(ctx, input.id, 'update');

			const [connection] = await ctx.db
				.update(dbConnections)
				.set({
					name: input.name,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(dbConnections.id, input.id))
				.returning({
					id: dbConnections.id,
					name: dbConnections.name,
					type: dbConnections.type,
					userId: dbConnections.userId,
					organizationId: dbConnections.organizationId,
					createdAt: dbConnections.createdAt,
					updatedAt: dbConnections.updatedAt,
				});

			if (!connection) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Connection not found',
				});
			}

			return connection;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await authorizeDbConnectionAccess(ctx, input.id, 'delete');

			const [connection] = await ctx.db
				.delete(dbConnections)
				.where(eq(dbConnections.id, input.id))
				.returning({
					id: dbConnections.id,
					name: dbConnections.name,
					type: dbConnections.type,
					userId: dbConnections.userId,
					organizationId: dbConnections.organizationId,
					createdAt: dbConnections.createdAt,
					updatedAt: dbConnections.updatedAt,
				});

			if (!connection) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Connection not found',
				});
			}

			return { success: true };
		}),
});
