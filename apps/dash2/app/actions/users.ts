"use server";

import { revalidatePath } from "next/cache";
import { db } from "@databuddy/db";
import { auth } from "@databuddy/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { z } from "zod";
import { uploadOptimizedImage } from "@/lib/supabase";
import type { CropData, ImageEditOptions } from "@/types/image";
import { logger } from "@sentry/nextjs";

// Helper to get authenticated user
const getUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) return null;
  return session.user;
});

// Profile update schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name cannot exceed 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name cannot exceed 50 characters"),
  image: z.string().url("Please enter a valid image URL").optional(),
});

/**
 * Uploads a profile image to Supabase storage with optional cropping and editing
 */
export async function uploadProfileImage(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { error: "Please upload an image file" };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Image size must be less than 5MB" };
    }

    // Get crop data if provided
    let cropData: CropData | undefined;
    const cropDataStr = formData.get("cropData");
    if (cropDataStr && typeof cropDataStr === "string") {
      try {
        cropData = JSON.parse(cropDataStr);
      } catch (e) {
        console.error("Failed to parse crop data", e);
      }
    }

    // Get edit options if provided
    let edits: ImageEditOptions | undefined;
    const editsStr = formData.get("edits");
    if (editsStr && typeof editsStr === "string") {
      try {
        edits = JSON.parse(editsStr);
      } catch (e) {
        console.error("Failed to parse edit options", e);
      }
    }

    // Upload to Supabase using the server-side function
    const result = await uploadOptimizedImage(
      file, 
      ["medium"], 
      "profile-images", 
      user.id,
      cropData,
      edits
    );
    
    return { url: result.medium };
  } catch (error) {
    console.error("Profile image upload error:", error);
    return { error: "Failed to upload image" };
  }
}

/**
 * Updates the user's profile information
 */
export async function updateUserProfile(formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Parse and validate form data
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const image = formData.get("image");

    // Validate the data
    const validatedData = profileUpdateSchema.parse({
      firstName,
      lastName,
      image: image || undefined,
    });

    // Update user in database
    await db.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        image: validatedData.image,
        // Set the display name to the full name
        name: `${validatedData.firstName} ${validatedData.lastName}`,
      }
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to update profile" };
  }
}

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
    console.error("Account deletion error:", error);
    return { error: "Failed to process account deletion" };
  }
} 