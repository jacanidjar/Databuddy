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
    const existingDomain = await db.domain.findFirst({
      where: {
        name: data.name,
      }
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

    const domain = await db.domain.create({
      data: {
        name: data.name,
        verificationToken,
        verificationStatus: "PENDING",
        ...ownerData
      }
    });

    console.log(`[Domain] Created: ${domain.id} (${domain.name})`);
    
    revalidatePath("/domains");
    return { data: domain };
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
    const domains = await db.domain.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { data: domains };
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
    const projectAccess = await db.projectAccess.findFirst({
      where: {
        projectId,
        userId: user.id
      }
    });

    if (!projectAccess) {
      return { error: "You don't have access to this project" };
    }

    const domains = await db.domain.findMany({
      where: {
        projectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { data: domains };
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
    const domain = await db.domain.findFirst({
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
    
    const domain = await db.domain.findFirst({
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

    if (!domain) {
      return { error: "Domain not found" };
    }

    // Only allow updating the name
    const { name } = data;
    
    const updated = await db.domain.update({
      where: { id },
      data: { name }
    });

    console.log(`[Domain] Updated: ${updated.id}`);
    
    revalidatePath("/domains");
    revalidatePath(`/domains/${id}`);
    return { data: updated };
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
    
    const domain = await db.domain.findFirst({
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

    if (!domain) {
      return { error: "Domain not found" };
    }

    await db.domain.delete({
      where: { id }
    });

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
    
    const domain = await db.domain.findFirst({
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

    if (!domain) {
      return { error: "Domain not found" };
    }

    // If already verified, return success
    if (domain.verifiedAt) {
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
        await db.domain.update({
          where: { id },
          data: {
            verifiedAt: new Date(),
            verificationStatus: "VERIFIED"
          }
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
      return { 
        data: { 
            verified: false, 
            message: "Verification token not found in DNS records. Your domain will remain unverified until verified." 
          } 
      };
    } catch (error) {
      console.error("[Verification] DNS lookup error:", error);
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
    
    const domain = await db.domain.findFirst({
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

    if (!domain) {
      return { error: "Domain not found" };
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    
    // Update domain with new token
    const updated = await db.domain.update({
      where: { id },
      data: {
        verificationToken,
        verificationStatus: "PENDING",
        verifiedAt: null
      }
    });

    console.log(`[Verification] Token regenerated: ${updated.id}`);
    
    revalidatePath("/domains");
    revalidatePath(`/domains/${id}`);
    
    return { data: updated };
  } catch (error) {
    console.error("[Verification] Token regeneration failed:", error);
    return { error: "Failed to regenerate verification token" };
  }
} 