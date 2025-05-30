"use server";

import { revalidatePath } from "next/cache";
import { db, websites, domains, projectAccess, eq, and, or, inArray } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { nanoid } from "nanoid";
import { z } from "zod";
import { logger } from "@/lib/discord-webhook";

// Types
type CreateWebsiteData = {
  name: string;
  domainId: string;
  domain: string;
  subdomain?: string;
};

type ApiResponse<T> = 
  | { data: T; error?: never }
  | { data?: never; error: string };

// Helper to get authenticated user
const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return session?.user ?? null;
});

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
async function verifyDomainAccess(domainId: string, userId: string): Promise<boolean> {
  if (!domainId || !userId) return false;
  
  try {
    const domain = await db.query.domains.findFirst({
      where: and(
        eq(domains.id, domainId),
        eq(domains.verificationStatus, "VERIFIED"),
        eq(domains.userId, userId)
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

export async function createWebsite(data: CreateWebsiteData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log("[Website] Creating website with data:", { ...data, userId: user.id });
    
    // Verify domain access
    const hasAccess = await verifyDomainAccess(data.domainId, user.id);
    if (!hasAccess) {
      return { error: "Domain not found or not verified" };
    }

    // Check for existing websites with the same domain
    const fullDomain = data.subdomain 
      ? `${data.subdomain}.${data.domain}`
      : data.domain;

    const existingWebsite = await db.query.websites.findFirst({
      where: eq(websites.domain, fullDomain)
    });

    if (existingWebsite) {
      return { error: `A website with the domain "${fullDomain}" already exists` };
    }

    const [website] = await db
      .insert(websites)
      .values({
        id: nanoid(),
        name: data.name,
        domain: fullDomain,
        domainId: data.domainId,
        userId: user.id,
      })
      .returning();

    console.log("[Website] Successfully created website:", website);

    // Log website creation to Discord
    await logger.success(
      'Website Created',
      `New website "${data.name}" was successfully created`,
      {
        domain: fullDomain,
        websiteId: website.id,
        userName: user.name || user.email,
      }
    );

    revalidatePath("/websites");
    return { success: true, data: website };
  } catch (error) {
    console.error("[Website] Error creating website:", error);
    
    // Log error to Discord
    await logger.error(
      'Website Creation Failed',
      `Failed to create website "${data.name}"`,
      {
        domain: data.subdomain ? `${data.subdomain}.${data.domain}` : data.domain,
        userName: user.name || user.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    if (error instanceof Error) {
      return { error: `Failed to create website: ${error.message}` };
    }
    return { error: "Failed to create website" };
  }
}

export async function updateWebsite(id: string, name: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log("[Website] Updating website name:", { id, name, userId: user.id });

    const website = await checkWebsiteAccess(id, user.id);
    if (!website) {
      console.log("[Website] Website not found or no access:", id);
      return { error: "Website not found" };
    }

    const [updatedWebsite] = await db
      .update(websites)
      .set({ name })
      .where(eq(websites.id, id))
      .returning();

    console.log("[Website] Successfully updated website:", updatedWebsite);

    revalidatePath("/websites");
    return { success: true, data: updatedWebsite };
  } catch (error) {
    console.error("[Website] Error updating website:", error);
    if (error instanceof Error) {
      return { error: `Failed to update website: ${error.message}` };
    }
    return { error: "Failed to update website" };
  }
}

// Get all websites for current user
export const getUserWebsites = async (userId?: string | null): Promise<ApiResponse<any>> => {
  const user = userId ? { id: userId } : await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const userWebsites = await db.query.websites.findMany({
      where: eq(websites.userId, user.id),
      orderBy: (websites, { desc }) => [desc(websites.createdAt)]
    });
    
    return { data: userWebsites };
  } catch (error) {
    return handleError("fetch user websites", error);
  }
}

// Get all websites for a project
export async function getProjectWebsites(projectId: string): Promise<ApiResponse<any>> {
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
    
    return { data: projectWebsites };
  } catch (error) {
    return handleError("fetch project websites", error);
  }
}

// Get single website by ID
export async function getWebsiteById(id: string): Promise<ApiResponse<any>> {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // const projectIds = await getUserProjectIds(user.id);
    
    if (user.role === 'ADMIN') {
      const website = await db.query.websites.findFirst({
        where: eq(websites.id, id)
      });
      return { data: website };
    }

    const website = await db.query.websites.findFirst({
      where: or(
        and(
          eq(websites.id, id),
          eq(websites.userId, user.id)
        ),
        and(
          eq(websites.id, id),
          // projectIds.length > 0 ? 
          //   inArray(websites.projectId, projectIds) : 
          eq(websites.id, "impossible-match")
        )
      )
    });
    
    if (!website) {
      return { error: "Website not found" };
    }
    
    return { data: website };
  } catch (error) {
    return handleError("fetch website", error);
  }
}

// Delete website
export async function deleteWebsite(id: string): Promise<ApiResponse<{ success: boolean }>> {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const website = await checkWebsiteAccess(id, user.id);
    if (!website) {
      return { error: "Website not found" };
    }

    await db.delete(websites)
      .where(eq(websites.id, id));

    // Log website deletion to Discord
    await logger.warning(
      'Website Deleted',
      `Website "${website.name}" was deleted`,
      {
        domain: website.domain,
        websiteId: id,
        userName: user.name || user.email,
      }
    );

    revalidatePath("/websites");
    
    return { data: { success: true } };
  } catch (error) {
    // Log deletion error to Discord
    await logger.error(
      'Website Deletion Failed',
      "Failed to delete website",
      {
        websiteId: id,
        userName: user.name || user.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    return handleError("delete website", error);
  }
} 