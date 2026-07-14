"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod";

const articleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  category: z.string().min(2, "Category must be at least 2 characters").max(50),
  readTime: z.string().min(2, "Read time must be specified (e.g. 5 min read)").max(20),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(300),
  content: z.string().min(20, "Content must be at least 20 characters"),
});

export async function createBlogPost(data: {
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
}) {
  // Validate input fields with Zod
  const result = articleSchema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.issues.map(err => err.message).join(", ");
    return { ok: false, error: errorMessages };
  }

  const { title, category, readTime, excerpt, content } = result.data;

  try {
    // Authenticate user session and verify admin role server-side
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || (session.user as any).role !== "admin") {
      return { ok: false, error: "Unauthorized. Admin credentials required." };
    }

    await prisma.blogPost.create({
      data: {
        title,
        category,
        readTime,
        excerpt,
        content,
        date: new Date().toISOString().split("T")[0] // YYYY-MM-DD
      }
    });

    // Revalidate the blog page cache
    revalidatePath("/blog");
    return { ok: true };
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return { ok: false, error: "Database operation failed. Verify schema." };
  }
}

export async function deleteBlogPost(id: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || (session.user as any).role !== "admin") {
      return { ok: false, error: "Unauthorized. Admin credentials required." };
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    revalidatePath("/blog");
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return { ok: false, error: "Database operation failed." };
  }
}
