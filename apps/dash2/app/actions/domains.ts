"use server";

import { revalidatePath } from "next/cache";
import { db, domains, eq, projectAccess, and, or, inArray } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { Resolver } from "node:dns";
import { randomUUID, randomBytes } from "node:crypto";
import { logger } from "@/lib/discord-webhook";

// --- Helpers ---

const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

const getUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? session.user : null;
});

function generateVerificationToken() {
  const token = `databuddy_${randomBytes(16).toString("hex")}`;
  console.log(`[Verification] Generated token: ${token}`);
  return token;
}

async function getUserProjectIds(userId: string) {
  const access = await db.query.projectAccess.findMany({
    where: eq(projectAccess.userId, userId),
    columns: { projectId: true }
  });
  return access.map(a => a.projectId);
}

async function findAccessibleDomain(user: any, id: string) {
  const projectIds = await getUserProjectIds(user.id);
  return db.query.domains.findFirst({
    where: or(
      and(eq(domains.id, id), eq(domains.userId, user.id)),
      and(
        eq(domains.id, id),
        projectIds.length > 0 ? inArray(domains.projectId, projectIds) : eq(domains.id, "impossible-match")
      )
    )
  });
}

function getOwnerData(user: any, data: { userId?: string; projectId?: string }) {
  if (data.userId) return { userId: data.userId };
  if (data.projectId) return { projectId: data.projectId };
  return { userId: user.id };
}

// --- Actions ---

export async function createDomain(data: { name: string; userId?: string; projectId?: string }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    console.log(`[Domain] Creating: ${data.name}`);
    const existingDomain = await db.query.domains.findFirst({ where: eq(domains.name, data.name) });
    if (existingDomain) return { error: "Domain already exists" };
    const verificationToken = generateVerificationToken();
    const ownerData = getOwnerData(user, data);
    const domainId = randomUUID();
    await db.insert(domains).values({
      id: domainId,
      name: data.name,
      verificationToken,
      verificationStatus: "PENDING",
      ...ownerData
    });
    const createdDomain = await db.query.domains.findFirst({ where: eq(domains.id, domainId) });

    // Log domain creation to Discord
    await logger.info(
      'Domain Added',
      `New domain "${data.name}" was added and is pending verification`,
      {
        domain: data.name,
        domainId,
        userName: user.name || user.email,
        verificationToken: `"${verificationToken.slice(0, 20)}..."`
      }
    );

    revalidatePath("/domains");
    return { data: createdDomain };
  } catch (error) {
    console.error("[Domain] Creation failed:", error);

    // Log domain creation error
    await logger.error(
      'Domain Creation Failed',
      `Failed to create domain "${data.name}"`,
      {
        domain: data.name,
        userName: user.name || user.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    return { error: "Failed to create domain" };
  }
}

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

export const getProjectDomains = cache(async (projectId: string) => {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    const access = await db.query.projectAccess.findFirst({
      where: and(eq(projectAccess.projectId, projectId), eq(projectAccess.userId, user.id))
    });
    if (!access) return { error: "You don't have access to this project" };
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

export const getDomainById = cache(async (id: string) => {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    const projectIds = await getUserProjectIds(user.id);
    const domain = await db.query.domains.findFirst({
      where: or(
        and(eq(domains.id, id), eq(domains.userId, user.id)),
        and(
          eq(domains.id, id),
          projectIds.length > 0 ? inArray(domains.projectId, projectIds) : eq(domains.id, "impossible-match")
        )
      )
    });
    if (!domain) return { error: "Domain not found" };
    return { data: domain };
  } catch (error) {
    console.error("[Domain] Fetch failed:", error);
    return { error: "Failed to fetch domain" };
  }
});

export async function updateDomain(id: string, data: { name?: string }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    console.log(`[Domain] Updating: ${id}`);
    const domain = await findAccessibleDomain(user, id);
    if (!domain) return { error: "Domain not found" };
    await db.update(domains).set({ name: data.name }).where(eq(domains.id, id));
    const updatedDomain = await db.query.domains.findFirst({ where: eq(domains.id, id) });
    revalidatePath("/domains");
    revalidatePath(`/domains/${id}`);
    return { data: updatedDomain };
  } catch (error) {
    console.error("[Domain] Update failed:", error);
    return { error: "Failed to update domain" };
  }
}

export async function deleteDomain(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    console.log(`[Domain] Deleting: ${id}`);
    const domain = await findAccessibleDomain(user, id);
    if (!domain) return { error: "Domain not found" };

    await db.delete(domains).where(eq(domains.id, id));

    // Log domain deletion to Discord
    await logger.warning(
      'Domain Deleted',
      `Domain "${domain.name}" was deleted`,
      {
        domain: domain.name,
        domainId: id,
        userName: user.name || user.email,
        wasVerified: domain.verificationStatus === 'VERIFIED'
      }
    );

    revalidatePath("/domains");
    return { success: true };
  } catch (error) {
    console.error("[Domain] Delete failed:", error);

    // Log deletion error
    await logger.error(
      'Domain Deletion Failed',
      'Failed to delete domain',
      {
        domainId: id,
        userName: user.name || user.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    return { error: "Failed to delete domain" };
  }
}

export async function checkDomainVerification(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  if (!id) return { error: "Invalid domain ID" };
  try {
    console.log(`[Verification] Checking: ${id}`);
    const domain = await findAccessibleDomain(user, id);
    if (!domain) return { error: "Domain not found" };
    if (!domain.name) return { error: "Invalid domain name" };
    const isLocalhost = domain.name.includes("localhost") || domain.name.includes("127.0.0.1");
    
    if (isLocalhost) {
      await db.update(domains).set({
        verifiedAt: new Date().toISOString(),
        verificationStatus: "VERIFIED"
      }).where(eq(domains.id, id));

      // Log localhost auto-verification
      await logger.success(
        'Domain Verified (Localhost)',
        `Localhost domain "${domain.name}" was automatically verified`,
        {
          domain: domain.name,
          domainId: id,
          userName: user.name || user.email,
          verificationType: 'automatic'
        }
      );

      return { data: { verified: true, message: "Localhost domain automatically verified" } };
    }
    
    if (domain.verificationStatus === "VERIFIED" && domain.verifiedAt) {
      return { data: { verified: true, message: "Domain already verified" } };
    }
    
    const rootDomain = domain.name.replace(/^www\./, "");
    const expectedToken = domain.verificationToken;
    if (!expectedToken) {
      return { data: { verified: false, message: "Missing verification token. Please regenerate the token and try again." } };
    }
    
    const dnsRecord = `_databuddy.${rootDomain}`;
    let txtRecords: string[][] | undefined;
    try {
      txtRecords = await new Promise<string[][]>((resolve, reject) => {
        resolver.resolveTxt(dnsRecord, (err, records) => {
          if (err) return reject(err);
          resolve(records);
        });
      });
    } catch (dnsError: unknown) {
      await db.update(domains).set({ verificationStatus: "FAILED" }).where(eq(domains.id, id));
      return { data: { verified: false, message: "DNS lookup failed. Please make sure the TXT record is correctly configured and try again." } };
    }
    
    if (!txtRecords || txtRecords.length === 0) {
      await db.update(domains).set({ verificationStatus: "FAILED" }).where(eq(domains.id, id));
      return { data: { verified: false, message: "No DNS records found. Please add the TXT record and wait for DNS propagation (which can take up to 24-48 hours)." } };
    }
    
    const isVerified = txtRecords.some(record => Array.isArray(record) && record.some(txt => typeof txt === "string" && txt.includes(expectedToken)));
    
    if (isVerified) {
      await db.update(domains).set({
        verifiedAt: new Date().toISOString(),
        verificationStatus: "VERIFIED"
      }).where(eq(domains.id, id));

      // Log successful domain verification
      await logger.success(
        'Domain Verified',
        `Domain "${domain.name}" was successfully verified via DNS`,
        {
          domain: domain.name,
          domainId: id,
          userName: user.name || user.email,
          verificationType: 'DNS'
        }
      );

      revalidatePath("/domains");
      revalidatePath(`/domains/${id}`);
      return { data: { verified: true, message: "Domain verified successfully. You can now use this domain for websites." } };
    }
    
    await db.update(domains).set({ verificationStatus: "FAILED" }).where(eq(domains.id, id));

    // Log verification failure
    await logger.warning(
      'Domain Verification Failed',
      `Domain "${domain.name}" verification failed - token not found in DNS`,
      {
        domain: domain.name,
        domainId: id,
        userName: user.name || user.email,
        dnsRecord,
        expectedToken: `"${expectedToken.slice(0, 20)}..."`
      }
    );

    return { data: { verified: false, message: "Verification token not found in DNS records. Please check your DNS configuration and try again." } };
  } catch (error) {
    console.error("[Verification] Check failed:", error);

    // Log verification error
    await logger.error(
      'Domain Verification Error',
      'Domain verification process encountered an error',
      {
        domainId: id,
        userName: user.name || user.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    );

    return { error: "Failed to check domain verification" };
  }
}

export async function regenerateVerificationToken(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };
  try {
    console.log(`[Verification] Regenerating token: ${id}`);
    const domain = await findAccessibleDomain(user, id);
    if (!domain) return { error: "Domain not found" };
    const verificationToken = generateVerificationToken();
    await db.update(domains).set({
      verificationToken,
      verificationStatus: "PENDING",
      verifiedAt: null
    }).where(eq(domains.id, id));
    const updatedDomain = await db.query.domains.findFirst({ where: eq(domains.id, id) });
    revalidatePath("/domains");
    revalidatePath(`/domains/${id}`);
    return { data: updatedDomain };
  } catch (error) {
    console.error("[Verification] Token regeneration failed:", error);
    return { error: "Failed to regenerate verification token" };
  }
} 