"use server";

import { revalidatePath } from "next/cache";
import { db } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";

// Helper to get authenticated user
const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) return null;
  return session.user;
});

// Create website with proper revalidation
export async function createWebsite(data: { domain: string; name: string }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Check if website already exists
    const existingWebsite = await db.website.findFirst({
      where: {
        domain: data.domain,
        userId: user.id
      }
    });

    if (existingWebsite) {
      return { error: "Website already exists" };
    }

    const website = await db.website.create({
      data: {
        domain: data.domain,
        name: data.name,
        userId: user.id
      }
    });

    revalidatePath("/websites");
    return { data: website };
  } catch (error) {
    console.error("Failed to create website:", error);
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
      orderBy: {
        createdAt: 'desc'
      }
    });
    return { data: websites };
  } catch (error) {
    console.error("Failed to fetch websites:", error);
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
        userId: user.id
      }
    });
    if (!website) return { error: "Website not found" };
    return { data: website };
  } catch (error) {
    console.error("Failed to fetch website:", error);
    return { error: "Failed to fetch website" };
  }
});

// Update website with revalidation
export async function updateWebsite(id: string, data: { domain?: string; name?: string }) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const website = await db.website.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!website) {
      return { error: "Website not found" };
    }

    const updated = await db.website.update({
      where: { id },
      data
    });

    revalidatePath("/websites");
    revalidatePath(`/websites/${id}`);
    return { data: updated };
  } catch (error) {
    console.error("Failed to update website:", error);
    return { error: "Failed to update website" };
  }
}

// Delete website with revalidation
export async function deleteWebsite(id: string) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const website = await db.website.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!website) {
      return { error: "Website not found" };
    }

    await db.website.delete({
      where: { id }
    });

    revalidatePath("/websites");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete website:", error);
    return { error: "Failed to delete website" };
  }
} 