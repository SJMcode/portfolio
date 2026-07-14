"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Verify if the active user is an authorized admin
async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session && (session.user as any).role === "admin";
}

// Update the profile bio summary
export async function updateProfileSummary(summary: string) {
  if (!(await checkAdmin())) {
    return { ok: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.profileInfo.upsert({
      where: { id: 1 },
      update: { summary },
      create: { id: 1, summary },
    });
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update profile summary:", error);
    return { ok: false, error: "Database write failed." };
  }
}

// Create a new work experience role
export async function addWorkExperience(data: {
  role: string;
  company: string;
  duration: string;
  description: string;
}) {
  if (!(await checkAdmin())) {
    return { ok: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    await prisma.workExperience.create({
      data: {
        role: data.role,
        company: data.company,
        duration: data.duration,
        description: data.description,
      },
    });
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("Failed to add work experience:", error);
    return { ok: false, error: "Database write failed." };
  }
}

// Fetch all dynamic profile settings
export async function getProfileData() {
  try {
    const info = await prisma.profileInfo.findUnique({
      where: { id: 1 },
    });
    const experiences = await prisma.workExperience.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      summary: info?.summary || null,
      experiences: experiences.map(exp => ({
        id: exp.id,
        role: exp.role,
        company: exp.company,
        duration: exp.duration,
        description: exp.description,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch profile settings from database:", error);
    return { summary: null, experiences: [] };
  }
}
