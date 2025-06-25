import { Hono } from 'hono';
import { db, websites, domains, projects, member, eq, and, or, inArray, sql, isNull } from '@databuddy/db';
import { authMiddleware } from '../../middleware/auth';
import { logger } from '../../lib/logger';
import { logger as discordLogger } from '../../lib/discord-webhook';
import { nanoid } from 'nanoid';
import { cacheable } from '@databuddy/redis';
import type { AppVariables } from '../../types';
import { z } from 'zod';
import { websiteAuthHook } from '../../middleware/website';

type WebsitesContext = {
  Variables: AppVariables & {
    user: any;
  };
};

export const websitesRouter = new Hono<WebsitesContext>();

const createWebsiteSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Invalid website name format'),
  domain: z.string().min(1).max(253).regex(/^[a-zA-Z0-9.-]+$/, 'Invalid domain format'),
  subdomain: z.string().max(63).regex(/^[a-zA-Z0-9-]*$/, 'Invalid subdomain format').optional(),
  domainId: z.string().uuid('Invalid domain ID format')
});

const updateWebsiteSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Invalid website name format')
});

websitesRouter.use('*', authMiddleware);
async function _getUserProjectIds(userId: string): Promise<string[]> {
  try {
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.organizationId, userId),
      columns: {
        id: true
      }
    });

    return userProjects.map(project => project.id);
  } catch (error) {
    logger.error('[Website API] Error fetching project IDs:', { error });
    return [];
  }
}

const getUserProjectIds = cacheable(_getUserProjectIds, {
  expireInSec: 300,
  prefix: 'user_projects',
  staleWhileRevalidate: true,
  staleTime: 60
});

async function checkWebsiteAccess(id: string, userId: string) {
  try {
    const projectIds = await getUserProjectIds(userId);

    return await db.query.websites.findFirst({
      where: or(
        and(
          eq(websites.id, id),
          eq(websites.userId, userId)
        ),
        and(
          eq(websites.id, id),
          projectIds.length > 0 ? inArray(websites.projectId, projectIds) : sql`FALSE`
        )
      )
    });
  } catch (error) {
    logger.error('[Website API] Error checking website access:', { error });
    return null;
  }
}

async function _verifyDomainAccess(domainId: string, userId: string, organizationId?: string | null): Promise<boolean> {
  if (!domainId || !userId) return false;

  try {
    let whereCondition;

    if (organizationId) {
      whereCondition = and(
        eq(domains.id, domainId),
        eq(domains.verificationStatus, "VERIFIED"),
        eq(domains.organizationId, organizationId)
      );
    } else {
      whereCondition = and(
        eq(domains.id, domainId),
        eq(domains.verificationStatus, "VERIFIED"),
        eq(domains.userId, userId),
        isNull(domains.organizationId)
      );
    }

    const domain = await db.query.domains.findFirst({
      where: whereCondition,
      columns: {
        id: true
      }
    });

    return !!domain;
  } catch (error) {
    logger.error('[Website API] Error verifying domain access:', { error });
    return false;
  }
}

const verifyDomainAccess = cacheable(_verifyDomainAccess, {
  expireInSec: 120,
  prefix: 'domain_access',
  staleWhileRevalidate: true,
  staleTime: 30
});
websitesRouter.post('/', async (c) => {
  const user = c.get('user');
  const rawData = await c.req.json();
  const organizationId = c.req.query('organizationId');

  if (!user) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    const validationResult = createWebsiteSchema.safeParse(rawData);
    if (!validationResult.success) {
      return c.json({
        success: false,
        error: "Invalid input data",
        details: validationResult.error.issues
      }, 400);
    }

    const data = validationResult.data;
    logger.info('[Website API] Creating website with data:', { ...data, userId: user.id, organizationId });
    const hasAccess = await verifyDomainAccess(data.domainId, user.id, organizationId);
    if (!hasAccess) {
      return c.json({
        success: false,
        error: "Domain not found or not verified"
      }, 400);
    }

    const fullDomain = data.subdomain
      ? `${data.subdomain}.${data.domain}`
      : data.domain;

    const existingWebsite = await db.query.websites.findFirst({
      where: eq(websites.domain, fullDomain)
    });

    if (existingWebsite) {
      return c.json({
        success: false,
        error: `A website with the domain "${fullDomain}" already exists`
      }, 400);
    }

    const [website] = await db
      .insert(websites)
      .values({
        id: nanoid(),
        name: data.name,
        domain: fullDomain,
        domainId: data.domainId,
        userId: user.id,
        organizationId: organizationId || null,
      })
      .returning();

    logger.info('[Website API] Successfully created website:', website);
    await discordLogger.success(
      'Website Created',
      `New website "${data.name}" was created with domain "${fullDomain}"`,
      {
        websiteId: website.id,
        websiteName: data.name,
        domain: fullDomain,
        userId: user.id
      }
    );

    return c.json({
      success: true,
      data: website
    });
  } catch (error) {
    logger.error('[Website API] Error creating website:', { error });

    if (error instanceof Error) {
      return c.json({
        success: false,
        error: `Failed to create website: ${error.message}`
      }, 500);
    }
    return c.json({
      success: false,
      error: "Failed to create website"
    }, 500);
  }
});

// UPDATE - PATCH /websites/:id
websitesRouter.patch(
  '/:id',
  websiteAuthHook({ website: ["update"] }),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const rawData = await c.req.json();
    const website = c.get('website');

    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    try {
      // Validate input data
      const validationResult = updateWebsiteSchema.safeParse(rawData);
      if (!validationResult.success) {
        return c.json({
          success: false,
          error: "Invalid input data",
          details: validationResult.error.issues
        }, 400);
      }

      const { name } = validationResult.data;
      logger.info('[Website API] Updating website name:', { id, name, userId: user.id });

      if (!website) {
        logger.info('[Website API] Website not found or no access:', { id });
        return c.json({
          success: false,
          error: "Website not found or you do not have permission."
        }, 404);
      }

      const [updatedWebsite] = await db
        .update(websites)
        .set({ name })
        .where(eq(websites.id, id))
        .returning();

      logger.info('[Website API] Successfully updated website:', updatedWebsite);

      // Discord notification for website update
      await discordLogger.info(
        'Website Updated',
        `Website "${website.name}" was renamed to "${name}"`,
        {
          websiteId: id,
          oldName: website.name,
          newName: name,
          domain: website.domain,
          userId: user.id
        }
      );

      return c.json({
        success: true,
        data: updatedWebsite
      });
    } catch (error) {
      logger.error('[Website API] Error updating website:', { error });
      if (error instanceof Error) {
        return c.json({
          success: false,
          error: `Failed to update website: ${error.message}`
        }, 500);
      }
      return c.json({
        success: false,
        error: "Failed to update website"
      }, 500);
    }
  }
);

websitesRouter.post(
  '/:id/transfer',
  websiteAuthHook({ website: ["update"] }),
  async (c) => {
    const user = c.get('user');
    const website = c.get('website');
    const { organizationId } = await c.req.json();

    if (!user || !website) {
      return c.json({ success: false, error: "Unauthorized or website not found" }, 401);
    }

    // If transferring to an organization, check for membership
    if (organizationId) {
      const membership = await db.query.member.findFirst({
        where: and(
          eq(member.userId, user.id),
          eq(member.organizationId, organizationId)
        )
      });

      if (!membership) {
        return c.json({ success: false, error: "You are not a member of the target organization." }, 403);
      }
    }

    const [updatedWebsite] = await db.update(websites).set({
      organizationId: organizationId || null,
      userId: organizationId ? website.userId : user.id,
    }).where(eq(websites.id, website.id)).returning();

    return c.json({ success: true, data: updatedWebsite });
  }
)

// GET ALL - GET /websites
websitesRouter.get('/', async (c) => {
  const user = c.get('user');
  const organizationId = c.req.query('organizationId');

  if (!user) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    let whereCondition;

    if (organizationId) {
      // Filter by organization
      whereCondition = eq(websites.organizationId, organizationId);
    } else {
      // Personal websites (no organization)
      whereCondition = and(
        eq(websites.userId, user.id),
        isNull(websites.organizationId)
      );
    }

    const userWebsites = await db.query.websites.findMany({
      where: whereCondition,
      orderBy: (websites, { desc }) => [desc(websites.createdAt)]
    });

    return c.json({
      success: true,
      data: userWebsites
    });
  } catch (error) {
    logger.error('[Website API] Error fetching user websites:', { error, organizationId });
    return c.json({
      success: false,
      error: "Failed to fetch websites"
    }, 500);
  }
});

// GET BY PROJECT - GET /websites/project/:projectId
websitesRouter.get('/project/:projectId', async (c) => {
  const user = c.get('user');
  const projectId = c.req.param('projectId');

  if (!user) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  try {
    // Check if user has access to the project
    const projectAccessRecord = await db.query.projects.findFirst({
      where: and(
        eq(projects.id, projectId),
        eq(projects.organizationId, user.id)
      )
    });

    if (!projectAccessRecord) {
      return c.json({
        success: false,
        error: "You don't have access to this project"
      }, 403);
    }

    const projectWebsites = await db.query.websites.findMany({
      where: eq(websites.projectId, projectId),
      orderBy: (websites, { desc }) => [desc(websites.createdAt)]
    });

    return c.json({
      success: true,
      data: projectWebsites
    });
  } catch (error) {
    logger.error('[Website API] Error fetching project websites:', { error });
    return c.json({
      success: false,
      error: "Failed to fetch project websites"
    }, 500);
  }
});

// GET BY ID - GET /websites/:id
websitesRouter.get(
  '/:id',
  websiteAuthHook(),
  async (c) => {
    const website = c.get('website');

    if (!website) {
      // This should technically be handled by the middleware, but as a safeguard
      return c.json({
        success: false,
        error: "Website not found or you do not have permission to access it."
      }, 404);
    }

    return c.json({
      success: true,
      data: website
    });
  }
);

// DELETE - DELETE /websites/:id
websitesRouter.delete(
  '/:id',
  websiteAuthHook({ website: ["delete"] }),
  async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const website = c.get('website');

    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }

    try {
      if (!website) {
        return c.json({
          success: false,
          error: "Website not found or you do not have permission."
        }, 404);
      }

      await db.delete(websites)
        .where(eq(websites.id, id));

      // Discord notification for website deletion
      await discordLogger.warning(
        'Website Deleted',
        `Website "${website.name}" with domain "${website.domain}" was deleted`,
        {
          websiteId: id,
          websiteName: website.name,
          domain: website.domain,
          userId: user.id
        }
      );

      return c.json({
        success: true,
        data: { success: true }
      });
    } catch (error) {
      logger.error('[Website API] Error deleting website:', { error });
      return c.json({
        success: false,
        error: "Failed to delete website"
      }, 500);
    }
  }
);

export default websitesRouter; 