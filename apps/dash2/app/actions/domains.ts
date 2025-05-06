"use server";

import { revalidatePath } from "next/cache";
import { db, domains, eq, desc, user, projectAccess, and, or, projects, sql, inArray } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";
import dns from "node:dns";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";

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

// Generate a verification token
function generateVerificationToken() {
  const token = `databuddy-${Math.random().toString(36).substring(2, 15)}`;
  console.log(`[Verification] Generated token: ${token}`);
  return token;
}

// Create domain with proper revalidation
export async function createDomain(data: { 
  name: string; 
  userId?: string;
  projectId?: string;
}) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Domain] Creating: ${data.name}`);
    
    // Check if domain already exists
    const existingDomain = await db.query.domains.findFirst({
      where: eq(domains.name, data.name)
    });

    if (existingDomain) {
      console.log(`[Domain] Already exists: ${data.name}`);
      return { error: "Domain already exists" };
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

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

    const domainId = randomUUID();
    
    // Insert domain record
    await db.insert(domains).values({
      id: domainId,
      name: data.name,
      verificationToken,
      verificationStatus: "PENDING",
      ...ownerData
    });
    
    // Fetch the newly created domain
    const createdDomain = await db.query.domains.findFirst({
      where: eq(domains.id, domainId)
    });

    revalidatePath("/domains");
    return { data: createdDomain };
  } catch (error) {
    console.error("[Domain] Creation failed:", error);
    return { error: "Failed to create domain" };
  }
}

// Get all domains for current user with caching
export const getUserDomains = cache(async () => {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const userDomains = await db.query.domains.findMany({
      where: eq(domains.userId, user.id),
      orderBy: (domains, { desc }) => [desc(domains.createdAt)]
    });
    
    return { data: userDomains };
  } catch (error) {
    console.error("[Domain] Fetch failed:", error);
    return { error: "Failed to fetch domains" };
  }
});

// Get all domains for a project with caching
export const getProjectDomains = cache(async (projectId: string) => {
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

    const projectDomains = await db.query.domains.findMany({
      where: eq(domains.projectId, projectId),
      orderBy: (domains, { desc }) => [desc(domains.createdAt)]
    });
    
    return { data: projectDomains };
  } catch (error) {
    console.error("[Domain] Fetch failed:", error);
    return { error: "Failed to fetch domains" };
  }
});

// Get single domain by ID with caching
export const getDomainById = cache(async (id: string) => {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Get all projects the user has access to
    const userProjectAccess = await db.query.projectAccess.findMany({
      where: eq(projectAccess.userId, user.id),
      columns: {
        projectId: true
      }
    });
    
    const projectIds = userProjectAccess.map(access => access.projectId);
    
    // Find domain where it's owned by the user or in a project they have access to
    const domain = await db.query.domains.findFirst({
      where: or(
        and(
          eq(domains.id, id),
          eq(domains.userId, user.id)
        ),
        and(
          eq(domains.id, id),
          projectIds.length > 0 ? 
            inArray(domains.projectId, projectIds) : 
            eq(domains.id, "impossible-match") // Will never match if no project ids
        )
      )
    });
    
    if (!domain) {
      return { error: "Domain not found" };
    }
    
    return { data: domain };
  } catch (error) {
    console.error("[Domain] Fetch failed:", error);
    return { error: "Failed to fetch domain" };
  }
});

// Update domain with revalidation
export async function updateDomain(id: string, data: { name?: string }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Domain] Updating: ${id}`);
    
    // Get all projects the user has access to
    const userProjectAccess = await db.query.projectAccess.findMany({
      where: eq(projectAccess.userId, user.id),
      columns: {
        projectId: true
      }
    });
    
    const projectIds = userProjectAccess.map(access => access.projectId);
    
    // Find domain where it's owned by the user or in a project they have access to
    const domain = await db.query.domains.findFirst({
      where: or(
        and(
          eq(domains.id, id),
          eq(domains.userId, user.id)
        ),
        and(
          eq(domains.id, id),
          projectIds.length > 0 ? 
            inArray(domains.projectId, projectIds) : 
            eq(domains.id, "impossible-match")
        )
      )
    });

    if (!domain) {
      return { error: "Domain not found" };
    }

    // Only allow updating the name
    const { name } = data;
    
    // Update the domain
    await db.update(domains)
      .set({ name })
      .where(eq(domains.id, id));

    // Fetch the updated domain
    const updatedDomain = await db.query.domains.findFirst({
      where: eq(domains.id, id)
    });

    console.log(`[Domain] Updated: ${id}`);
    
    revalidatePath("/domains");
    revalidatePath(`/domains/${id}`);
    return { data: updatedDomain };
  } catch (error) {
    console.error("[Domain] Update failed:", error);
    return { error: "Failed to update domain" };
  }
}

// Delete domain with revalidation
export async function deleteDomain(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Domain] Deleting: ${id}`);
    
    // Get all projects the user has access to
    const userProjectAccess = await db.query.projectAccess.findMany({
      where: eq(projectAccess.userId, user.id),
      columns: {
        projectId: true
      }
    });
    
    const projectIds = userProjectAccess.map(access => access.projectId);
    
    // Find domain where it's owned by the user or in a project they have access to
    const domain = await db.query.domains.findFirst({
      where: or(
        and(
          eq(domains.id, id),
          eq(domains.userId, user.id)
        ),
        and(
          eq(domains.id, id),
          projectIds.length > 0 ? 
            inArray(domains.projectId, projectIds) : 
            eq(domains.id, "impossible-match") // Will never match if no project ids
        )
      )
    });

    if (!domain) {
      return { error: "Domain not found" };
    }

    await db.delete(domains)
      .where(eq(domains.id, id));

    console.log(`[Domain] Deleted: ${id}`);
    
    revalidatePath("/domains");
    return { success: true };
  } catch (error) {
    console.error("[Domain] Delete failed:", error);
    return { error: "Failed to delete domain" };
  }
}

// Check domain verification status
export async function checkDomainVerification(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Verification] Checking: ${id}`);
    
    // Get all projects the user has access to
    const userProjectAccess = await db.query.projectAccess.findMany({
      where: eq(projectAccess.userId, user.id),
      columns: {
        projectId: true
      }
    });
    
    const projectIds = userProjectAccess.map(access => access.projectId);
    
    // Find domain where it's owned by the user or in a project they have access to
    const domain = await db.query.domains.findFirst({
      where: or(
        and(
          eq(domains.id, id),
          eq(domains.userId, user.id)
        ),
        and(
          eq(domains.id, id),
          projectIds.length > 0 ? 
            inArray(domains.projectId, projectIds) : 
            eq(domains.id, "impossible-match")
        )
      )
    });

    if (!domain) {
      return { error: "Domain not found" };
    }

    // Check if domain is localhost
    const isLocalhost = domain.name.includes('localhost') || domain.name.includes('127.0.0.1');
    if (isLocalhost) {
      // Auto-verify localhost domains
      await db.update(domains)
        .set({
          verifiedAt: new Date().toISOString(),
          verificationStatus: "VERIFIED"
        })
        .where(eq(domains.id, id));
      
      return { 
        data: { 
          verified: true, 
          message: "Localhost domain automatically verified" 
        } 
      };
    }

    // If already verified, return success
    if (domain.verificationStatus === "VERIFIED" && domain.verifiedAt) {
      console.log(`[Verification] Already verified: ${domain.name}`);
      return { data: { verified: true, message: "Domain already verified" } };
    }

    // Extract domain from URL and remove www. prefix
    const domainName = domain.name;
    const rootDomain = domainName.replace(/^www\./, '');
    console.log(`[Verification] Checking DNS for: ${rootDomain}`);
    
    // Check for TXT record
    try {
      const dnsRecord = `_databuddy.${rootDomain}`;
      console.log(`[Verification] Looking up: ${dnsRecord}`);
      
      const txtRecords = await dns.promises.resolveTxt(dnsRecord);
      console.log(`[Verification] Found ${txtRecords.length} TXT records`);
      
      // Check if any TXT record contains our verification token
      const expectedToken = domain.verificationToken || '';
      
      const isVerified = txtRecords.some(record => 
        record.some(txt => txt.includes(expectedToken))
      );
      
      if (isVerified) {
        console.log(`[Verification] Success: ${domain.name}`);
        
        // Update domain as verified
        await db.update(domains)
          .set({
            verifiedAt: new Date().toISOString(),
            verificationStatus: "VERIFIED"
          })
          .where(eq(domains.id, id));
        
        // Fetch updated domain
        const updatedDomain = await db.query.domains.findFirst({
          where: eq(domains.id, id)
        });
        
        revalidatePath("/domains");
        revalidatePath(`/domains/${id}`);
        
        return { 
          data: { 
            verified: true, 
            message: "Domain verified successfully. You can now use this domain for websites." 
          } 
        };
      }
      
      console.log(`[Verification] Failed: ${domain.name} - token not found`);
      
      // Update domain as failed
      await db.update(domains)
        .set({
          verificationStatus: "FAILED"
        })
        .where(eq(domains.id, id));
      
      return { 
        data: { 
          verified: false, 
          message: "Verification token not found in DNS records. Your domain will remain unverified until verified." 
        } 
      };
    } catch (error) {
      console.error("[Verification] DNS lookup error:", error);
      
      // Update domain as failed
      await db.update(domains)
        .set({
          verificationStatus: "FAILED"
        })
        .where(eq(domains.id, id));
      
      return { 
        data: { 
          verified: false, 
          message: "Could not find verification record. Make sure the DNS record has been added and propagated. Your domain will remain unverified until verified." 
        } 
      };
    }
  } catch (error) {
    console.error("[Verification] Check failed:", error);
    return { error: "Failed to check domain verification" };
  }
}

// Regenerate verification token
export async function regenerateVerificationToken(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    console.log(`[Verification] Regenerating token: ${id}`);
    
    // Get all projects the user has access to
    const userProjectAccess = await db.query.projectAccess.findMany({
      where: eq(projectAccess.userId, user.id),
      columns: {
        projectId: true
      }
    });
    
    const projectIds = userProjectAccess.map(access => access.projectId);
    
    // Find domain where it's owned by the user or in a project they have access to
    const domain = await db.query.domains.findFirst({
      where: or(
        and(
          eq(domains.id, id),
          eq(domains.userId, user.id)
        ),
        and(
          eq(domains.id, id),
          projectIds.length > 0 ? 
            inArray(domains.projectId, projectIds) : 
            eq(domains.id, "impossible-match")
        )
      )
    });

    if (!domain) {
      return { error: "Domain not found" };
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    
    // Update domain with new token
    await db.update(domains)
      .set({
        verificationToken,
        verificationStatus: "PENDING",
        verifiedAt: null
      })
      .where(eq(domains.id, id));

    // Fetch the updated domain
    const updatedDomain = await db.query.domains.findFirst({
      where: eq(domains.id, id)
    });
    
    console.log(`[Verification] Token regenerated: ${id}`);
    
    revalidatePath("/domains");
    revalidatePath(`/domains/${id}`);
    
    return { data: updatedDomain };
  } catch (error) {
    console.error("[Verification] Token regeneration failed:", error);
    return { error: "Failed to regenerate verification token" };
  }
} 