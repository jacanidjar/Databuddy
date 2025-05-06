"use server";

import { revalidatePath } from "next/cache";
import { db, websites, domains, projectAccess, eq, and, or, inArray, sql } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { cacheable } from "@databuddy/redis/cacheable";
import { randomUUID } from "node:crypto";

// Types
type WebsiteData = {
  domain: string;
  name: string;
  domainId?: string | null;
  userId?: string | null;
  projectId?: string | null;
};

type WebsiteUpdateData = Partial<WebsiteData>;

type ApiResponse<T> = 
  | { data: T; error?: never }
  | { data?: never; error: string };

// Cache configuration
const CACHE_CONFIG = {
  expireInSec: 3600, // 1 hour cache
  staleWhileRevalidate: true,
  staleTime: 300 // 5 minutes stale threshold
};

// Helper to get authenticated user
const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) return null;
  return session.user;
});

// Helper to normalize a domain (remove protocol, www, and trailing slash)
function normalizeDomain(domain: string): string {
  if (!domain) return '';
  let normalized = domain.trim().toLowerCase();
  normalized = normalized.replace(/^(https?:\/\/)?(www\.)?/i, '');
  normalized = normalized.replace(/\/+$/, '');
  return normalized;
}

// Get normalized variations of a domain for duplicate checking
function getDomainVariations(domain: string): string[] {
  const normalized = normalizeDomain(domain);
  return [
    normalized,
    `www.${normalized}`,
    `http://${normalized}`,
    `https://${normalized}`,
    `http://www.${normalized}`,
    `https://www.${normalized}`
  ];
}

// Get project IDs where user has access
async function getUserProjectIds(userId: string): Promise<string[]> {
  try {
    const projects = await db.query.projectAccess.findMany({
      where: eq(projectAccess.userId, userId),
      columns: {
        projectId: true
      }
    });
    
    return projects.map(access => access.projectId);
  } catch (error) {
    console.error("[Website] Error fetching project IDs:", error);
    return [];
  }
}

// Shared function to check user access to a website
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
          projectIds.length > 0 ? 
            inArray(websites.projectId, projectIds) : 
            eq(websites.id, "impossible-match")
        )
      )
    });
  } catch (error) {
    console.error("[Website] Error checking website access:", error);
    return null;
  }
}

// Verify domain ownership and verification status
async function verifyDomainAccess(domainId: string, ownerId: string | null, isProject = false): Promise<boolean> {
  if (!domainId || !ownerId) return false;
  
  try {
    const domain = await db.query.domains.findFirst({
      where: and(
        eq(domains.id, domainId),
        or(
          eq(domains.verificationStatus, "VERIFIED"),
          sql`${domains.name} LIKE '%localhost%' OR ${domains.name} LIKE '%127.0.0.1%'`
        ),
        isProject ? 
          eq(domains.projectId, ownerId) : 
          eq(domains.userId, ownerId)
      )
    });

    return !!domain;
  } catch (error) {
    console.error("[Website] Error verifying domain access:", error);
    return false;
  }
}

// Standardized error handler
function handleError(context: string, error: unknown): ApiResponse<never> {
  console.error(`[Website] ${context}:`, error);
  return { error: `Failed to ${context.toLowerCase()}. Please try again later.` };
}

// Helper to invalidate all relevant website caches after modifications
async function invalidateWebsiteCaches(userId?: string | null, projectId?: string | null): Promise<void> {
  try {
    // Clear user websites cache if userId provided
    if (userId) {
      await getUserWebsites.clearAll();
    }
    
    // Clear project websites cache if projectId provided
    if (projectId) {
      await getProjectWebsites.clear(projectId);
    }
    
    // Clear individual website caches for affected entities
    const conditions = [];
    if (userId) conditions.push({ userId });
    if (projectId) conditions.push({ projectId });
    
    if (conditions.length) {
      const websiteResults = await db.query.websites.findMany({
        where: userId && projectId ? 
          or(eq(websites.userId, userId), eq(websites.projectId, projectId)) :
          userId ? eq(websites.userId, userId) : 
          projectId ? eq(websites.projectId, projectId) : undefined,
        columns: {
          id: true
        }
      });
      
      for (const { id } of websiteResults) {
        await getWebsiteById.clear(id);
      }
    }
  } catch (error) {
    console.error("[Website] Error invalidating caches:", error);
  }
}

// Create website with proper revalidation and cache invalidation
export async function createWebsite(data: WebsiteData): Promise<ApiResponse<any>> {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const normalizedDomain = normalizeDomain(data.domain);
    if (!normalizedDomain) return { error: "Invalid domain" };
    
    // Check for existing website with this domain
    const existingWebsite = await db.query.websites.findFirst({
      where: or(...getDomainVariations(normalizedDomain).map(domain => eq(websites.domain, domain)))
    });

    if (existingWebsite) {
      return { error: "Website already exists with this domain" };
    }

    // Determine ownership
    const ownerData: Record<string, string> = {};
    if (data.userId) {
      ownerData.userId = data.userId;
    } else if (data.projectId) {
      ownerData.projectId = data.projectId;
    } else {
      ownerData.userId = user.id;
    }

    // Verify domain access if domainId is provided
    const ownerId = ownerData.userId || ownerData.projectId;
    const isProject = !!ownerData.projectId;
    
    if (data.domainId && !(await verifyDomainAccess(data.domainId, ownerId, isProject))) {
      return { error: "Domain not found or not verified" };
    }

    // Create website with a unique ID
    const websiteId = randomUUID();
    
    await db.insert(websites).values({
      id: websiteId,
      domain: normalizedDomain,
      name: data.name,
      domainId: data.domainId,
      ...ownerData
    });
    
    // Fetch the newly created website
    const website = await db.query.websites.findFirst({
      where: eq(websites.id, websiteId)
    });
    
    if (!website) {
      return { error: "Failed to create website. Database operation succeeded but couldn't retrieve the new website." };
    }
    
    // Fetch domain information if domainId exists
    const result: any = { ...website };
    
    if (website.domainId) {
      const domainRecord = await db.query.domains.findFirst({
        where: eq(domains.id, website.domainId)
      });
      
      if (domainRecord) {
        // Add domain record under a separate key
        result.domainData = domainRecord;
        // Make sure domain property is a string
        result.domain = website.domain;
      }
    }
    
    // Invalidate caches and revalidate paths
    await invalidateWebsiteCaches(ownerData.userId, ownerData.projectId);
    revalidatePath("/websites");
    
    return { data: result };
  } catch (error) {
    return handleError("create website", error);
  }
}

// Get all websites for current user with Redis caching
export const getUserWebsites = cacheable(
  async (userId?: string | null): Promise<ApiResponse<any>> => {
    const user = userId ? { id: userId } : await getUser();
    if (!user) return { error: "Unauthorized" };

    try {
      const userWebsites = await db.query.websites.findMany({
        where: eq(websites.userId, user.id),
        orderBy: (websites, { desc }) => [desc(websites.createdAt)]
      });
      
      // Fetch domain information for websites with domainId
      const websitesData = await Promise.all(
        userWebsites.map(async (website) => {
          // Create a result object that includes any additional properties we might add
          const result: any = { ...website };
          
          if (website.domainId) {
            const domainRecord = await db.query.domains.findFirst({
              where: eq(domains.id, website.domainId)
            });
            
            if (domainRecord) {
              // Ensure domain is stored correctly - in both properties
              result.domainData = domainRecord;
              // Make sure domain property is a string
              result.domain = website.domain;
            }
          }
          
          return result;
        })
      );
      
      return { data: websitesData };
    } catch (error) {
      return handleError("fetch user websites", error);
    }
  },
  { ...CACHE_CONFIG, prefix: 'user-websites' }
);

// Get all websites for a project with Redis caching
export const getProjectWebsites = cacheable(
  async (projectId: string): Promise<ApiResponse<any>> => {
    const user = await getUser();
    if (!user) return { error: "Unauthorized" };

    try {
      // Check if user has access to the project
      const projectAccessRecord = await db.query.projectAccess.findFirst({
        where: and(
          eq(projectAccess.projectId, projectId),
          eq(projectAccess.userId, user.id)
        )
      });

      if (!projectAccessRecord) {
        return { error: "You don't have access to this project" };
      }

      const projectWebsites = await db.query.websites.findMany({
        where: eq(websites.projectId, projectId),
        orderBy: (websites, { desc }) => [desc(websites.createdAt)]
      });
      
      // Fetch domain information for websites with domainId
      const websitesData = await Promise.all(
        projectWebsites.map(async (website) => {
          // Create a result object that includes any additional properties we might add
          const result: any = { ...website };
          
          if (website.domainId) {
            const domainRecord = await db.query.domains.findFirst({
              where: eq(domains.id, website.domainId)
            });
            
            if (domainRecord) {
              // Ensure domain is stored correctly - in both properties
              result.domainData = domainRecord;
              // Make sure domain property is a string
              result.domain = website.domain;
            }
          }
          
          return result;
        })
      );
      
      return { data: websitesData };
    } catch (error) {
      return handleError("fetch project websites", error);
    }
  },
  { ...CACHE_CONFIG, prefix: 'project-websites' }
);

// Get single website by ID with Redis caching
export const getWebsiteById = cacheable(
  async (id: string): Promise<ApiResponse<any>> => {
    const user = await getUser();
    if (!user) return { error: "Unauthorized" };

    try {
      const projectIds = await getUserProjectIds(user.id);
      
      const website = await db.query.websites.findFirst({
        where: or(
          and(
            eq(websites.id, id),
            eq(websites.userId, user.id)
          ),
          and(
            eq(websites.id, id),
            projectIds.length > 0 ? 
              inArray(websites.projectId, projectIds) : 
              eq(websites.id, "impossible-match")
          )
        )
      });
      
      if (!website) {
        return { error: "Website not found" };
      }
      
      // Fetch domain information if domainId exists
      const result: any = { ...website };
      
      if (website.domainId) {
        const domainRecord = await db.query.domains.findFirst({
          where: eq(domains.id, website.domainId)
        });
        
        if (domainRecord) {
          // Ensure domain is stored correctly - in both properties
          result.domainData = domainRecord;
          // Make sure domain property is a string
          result.domain = website.domain;
        }
      }
      
      return { data: result };
    } catch (error) {
      return handleError("fetch website", error);
    }
  },
  { ...CACHE_CONFIG, prefix: 'website-by-id' }
);

// Update website with cache invalidation
export async function updateWebsite(id: string, data: WebsiteUpdateData): Promise<ApiResponse<any>> {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const website = await checkWebsiteAccess(id, user.id);
    if (!website) {
      return { error: "Website not found" };
    }

    // Verify domain if provided
    if (data.domainId) {
      const ownerId = website.userId || website.projectId;
      const isProject = !!website.projectId;
      
      if (!(await verifyDomainAccess(data.domainId, ownerId, isProject))) {
        return { error: "Domain not found or not verified" };
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      name: data.name,
      domainId: data.domainId
    };

    if (data.domain) {
      updateData.domain = normalizeDomain(data.domain);
    }
    
    // Remove undefined fields
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }
    
    // Update website
    await db.update(websites)
      .set(updateData)
      .where(eq(websites.id, id));
      
    // Fetch the updated website
    const updatedWebsite = await db.query.websites.findFirst({
      where: eq(websites.id, id)
    });
    
    if (!updatedWebsite) {
      return { error: "Failed to update website. Database operation succeeded but couldn't retrieve the updated website." };
    }

    // Fetch domain information if domainId exists
    const result: any = { ...updatedWebsite };
    
    if (updatedWebsite.domainId) {
      const domainRecord = await db.query.domains.findFirst({
        where: eq(domains.id, updatedWebsite.domainId)
      });
      
      if (domainRecord) {
        // Ensure domain is stored correctly - in both properties
        result.domainData = domainRecord;
        // Make sure domain property is a string
        result.domain = updatedWebsite.domain;
      }
    }

    // Invalidate caches and revalidate paths
    await invalidateWebsiteCaches(website.userId, website.projectId);
    await getWebsiteById.clear(id);
    revalidatePath("/websites");
    revalidatePath(`/websites/${id}`);
    
    return { data: result };
  } catch (error) {
    return handleError("update website", error);
  }
}

// Delete website with cache invalidation
export async function deleteWebsite(id: string): Promise<ApiResponse<{ success: boolean }>> {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const website = await checkWebsiteAccess(id, user.id);
    if (!website) {
      return { error: "Website not found" };
    }

    // Store website info before deletion for cache invalidation
    const websiteUserId = website.userId;
    const websiteProjectId = website.projectId;

    // Delete website
    await db.delete(websites)
      .where(eq(websites.id, id));

    // Invalidate caches and revalidate paths
    await invalidateWebsiteCaches(websiteUserId, websiteProjectId);
    await getWebsiteById.clear(id);
    revalidatePath("/websites");
    
    return { data: { success: true } };
  } catch (error) {
    return handleError("delete website", error);
  }
} 