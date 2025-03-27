"use server";

import { revalidatePath } from "next/cache";
import { db } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { createLogger } from "@databuddy/logger";

const logger = createLogger("users-actions");

// Helper to get authenticated user
const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) return null;
  return session.user;
});

/**
 * Handles soft deletion of a user account
 */
export async function deactivateUserAccount(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const password = formData.get("password");
    if (!password || typeof password !== "string") {
      return { error: "Password is required" };
    }

    const email = formData.get("email");
    if (!email || typeof email !== "string" || email !== user.email) {
      return { error: "Email address doesn't match your account" };
    }

    // Password verification would be done here
    // This is a placeholder for actual password verification

    await db.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        // Store scheduled deletion date in database
        // This record is used by a cleanup job to permanently delete after grace period
      }
    });

    // You might want to also terminate all sessions
    // await db.session.deleteMany({ where: { userId: user.id } });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    logger.error("Account deletion error:", error);
    return { error: "Failed to process account deletion" };
  }
} 