"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Baseline likes (offset) to keep the counts starting from your current 148
const BASELINE_LIKES = 148;

export async function getEndorsementCount() {
  try {
    const dbCount = await prisma.endorsement.count();
    return BASELINE_LIKES + dbCount;
  } catch (error) {
    console.warn("Could not fetch endorsements from database, returning baseline.", error);
    return BASELINE_LIKES;
  }
}

export async function incrementEndorsement() {
  try {
    // Insert a new unique endorsement record
    await prisma.endorsement.create({
      data: {}
    });

    // Revalidate the count
    const nextCount = await prisma.endorsement.count();

    // Revalidate landing page cache to pull new total instantly
    revalidatePath("/");

    return { ok: true, count: BASELINE_LIKES + nextCount };
  } catch (error) {
    console.error("Failed to save endorsement:", error);
    return { ok: false, error: "Database operation failed. Verify DATABASE_URL in .env." };
  }
}
