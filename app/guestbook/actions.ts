"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod";

// Zod Input Validation Schema
const guestbookSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  text: z.string().min(5, "Message must be at least 5 characters").max(500),
});

export async function addMessage(data: { name: string; text: string }) {
  // Validate input fields with Zod
  const result = guestbookSchema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.issues.map(err => err.message).join(", ");
    return { ok: false, error: errorMessages };
  }

  const { name, text } = result.data;

  try {
    // Check if user session exists (Server-side check)
    const session = await auth.api.getSession({
      headers: await headers()
    });

    await prisma.guestbook.create({
      data: {
        name,
        text,
        userId: session?.user?.id || null // Link comment to authenticated User model if logged in
      }
    });

    // Revalidate the guestbook page cache to display new messages instantly
    revalidatePath("/guestbook");
    return { ok: true };
  } catch (error) {
    console.error("Database error adding guestbook message:", error);
    return { ok: false, error: "Database operation failed. Make sure your DATABASE_URL is set in .env." };
  }
}

export async function deleteGuestbookEntry(id: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || (session.user as any).role !== "admin") {
      return { ok: false, error: "Unauthorized. Admin credentials required." };
    }

    await prisma.guestbook.delete({
      where: { id }
    });

    revalidatePath("/guestbook");
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete guestbook entry:", error);
    return { ok: false, error: "Database operation failed." };
  }
}
