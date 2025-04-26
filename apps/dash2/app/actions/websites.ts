"use server";

import { revalidatePath } from "next/cache";
import { db } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";
import dns from "node:dns";
import { promisify } from "node:util";

// Promisify DNS lookup
const dnsLookup = promisify(dns.lookup);

// Helper to get authenticated user
const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) return null;
  return session.user;
});

// Create website with proper revalidation
export async function createWebsite(data: { 
  domain: string; 
  name: string;
  domainId?: string; // Optional reference to a verified domain
  userId?: string;
  projectId?: string;
}) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Website] Creating: ${data.name} (${data.domain})`);
    
    // Check if website already exists
    const existingWebsite = await db.website.findFirst({
      where: {
        domain: data.domain,
      }
    });

    if (existingWebsite) {
      console.log(`[Website] Already exists: ${data.domain}`);
      return { error: "Website already exists" };
    }

    // Determine ownership (user or project)
    const ownerData: any = {};
    if (data.userId) {
      ownerData.userId = data.userId;
    } else if (data.projectId) {
      ownerData.projectId = data.projectId;
    } else {
      // Default to current user if no specific owner is provided
      ownerData.userId = user.id;
    }

    // If domainId is provided, check if it exists and is verified
    if (data.domainId) {
      const domain = await db.domain.findFirst({
        where: {
          id: data.domainId,
          verificationStatus: "VERIFIED",
          OR: [
            { userId: ownerData.userId },
            { projectId: ownerData.projectId }
          ]
        }
      });

      if (!domain) {
        return { error: "Domain not found or not verified" };
      }
    }

    const website = await db.website.create({
      data: {
        domain: data.domain,
        name: data.name,
        domainId: data.domainId, // Link to verified domain if provided
        ...ownerData
      }
    });

    console.log(`[Website] Created: ${website.id} (${website.domain})`);
    
    revalidatePath("/websites");
    return { data: website };
  } catch (error) {
    console.error("[Website] Creation failed:", error);
    return { error: "Failed to create website" };
  }
}

// Get all websites for current user with caching
export const getUserWebsites = cache(async () => {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const websites = await db.website.findMany({
      where: {
        userId: user.id
      },
      include: {
        verifiedDomain: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { data: websites };
  } catch (error) {
    console.error("[Website] Fetch failed:", error);
    return { error: "Failed to fetch websites" };
  }
});

// Get all websites for a project with caching
export const getProjectWebsites = cache(async (projectId: string) => {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Check if user has access to the project
    const projectAccess = await db.projectAccess.findFirst({
      where: {
        projectId,
        userId: user.id
      }
    });

    if (!projectAccess) {
      return { error: "You don't have access to this project" };
    }

    const websites = await db.website.findMany({
      where: {
        projectId
      },
      include: {
        verifiedDomain: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { data: websites };
  } catch (error) {
    console.error("[Website] Fetch failed:", error);
    return { error: "Failed to fetch websites" };
  }
});

// Get single website by ID with caching
export const getWebsiteById = cache(async (id: string) => {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const website = await db.website.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { 
            projectId: {
              in: await db.projectAccess.findMany({
                where: { userId: user.id },
                select: { projectId: true }
              }).then(access => access.map(a => a.projectId))
            }
          }
        ]
      },
      include: {
        verifiedDomain: true
      }
    });
    
    if (!website) {
      return { error: "Website not found" };
    }
    
    return { data: website };
  } catch (error) {
    console.error("[Website] Fetch failed:", error);
    return { error: "Failed to fetch website" };
  }
});

// Update website with revalidation
export async function updateWebsite(id: string, data: { 
  domain?: string; 
  name?: string;
  domainId?: string | null; // Allow setting or removing domain reference
}) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Website] Updating: ${id}`);
    
    const website = await db.website.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { 
            projectId: {
              in: await db.projectAccess.findMany({
                where: { userId: user.id },
                select: { projectId: true }
              }).then(access => access.map(a => a.projectId))
            }
          }
        ]
      }
    });

    if (!website) {
      return { error: "Website not found" };
    }

    // If domainId is provided, check if it exists and is verified
    if (data.domainId) {
      const domain = await db.domain.findFirst({
        where: {
          id: data.domainId,
          verificationStatus: "VERIFIED",
          OR: [
            { userId: website.userId },
            { projectId: website.projectId }
          ]
        }
      });

      if (!domain) {
        return { error: "Domain not found or not verified" };
      }
    }
    
    const updated = await db.website.update({
      where: { id },
      data: {
        name: data.name,
        domainId: data.domainId
      }
    });

    console.log(`[Website] Updated: ${updated.id}`);
    
    revalidatePath("/websites");
    revalidatePath(`/websites/${id}`);
    return { data: updated };
  } catch (error) {
    console.error("[Website] Update failed:", error);
    return { error: "Failed to update website" };
  }
}

// Delete website with revalidation
export async function deleteWebsite(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Website] Deleting: ${id}`);
    
    const website = await db.website.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { 
            projectId: {
              in: await db.projectAccess.findMany({
                where: { userId: user.id },
                select: { projectId: true }
              }).then(access => access.map(a => a.projectId))
            }
          }
        ]
      }
    });

    if (!website) {
      return { error: "Website not found" };
    }

    await db.website.delete({
      where: { id }
    });

    console.log(`[Website] Deleted: ${id}`);
    
    revalidatePath("/websites");
    return { success: true };
  } catch (error) {
    console.error("[Website] Delete failed:", error);
    return { error: "Failed to delete website" };
  }
} 