"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Skill, ProjectCase } from "@prisma/client";

// Verify admin authorization
async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session && (session.user as any).role === "admin";
}

// Add competency skill
export async function addSkill(name: string) {
  if (!(await checkAdmin())) {
    return { ok: false, error: "Unauthorized. Admin credentials required." };
  }

  try {
    await prisma.skill.create({
      data: { name: name.trim() }
    });
    revalidatePath("/skills");
    return { ok: true };
  } catch (error) {
    console.error("Failed to add skill:", error);
    return { ok: false, error: "Skill already exists or database error." };
  }
}

// Delete competency skill
export async function deleteSkill(id: string) {
  if (!(await checkAdmin())) {
    return { ok: false, error: "Unauthorized. Admin credentials required." };
  }

  try {
    await prisma.skill.delete({
      where: { id }
    });
    revalidatePath("/skills");
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete skill:", error);
    return { ok: false, error: "Database operation failed." };
  }
}

// Add project case study
export async function addProjectCase(data: {
  title: string;
  category: string;
  image: string;
  url: string;
  techStack: string;
  linkText: string;
}) {
  if (!(await checkAdmin())) {
    return { ok: false, error: "Unauthorized. Admin credentials required." };
  }

  try {
    await prisma.projectCase.create({
      data: {
        title: data.title,
        category: data.category,
        image: data.image,
        url: data.url,
        techStack: data.techStack,
        linkText: data.linkText,
      }
    });
    revalidatePath("/skills");
    return { ok: true };
  } catch (error) {
    console.error("Failed to add project case:", error);
    return { ok: false, error: "Database operation failed." };
  }
}

// Delete project case study
export async function deleteProjectCase(id: string) {
  if (!(await checkAdmin())) {
    return { ok: false, error: "Unauthorized. Admin credentials required." };
  }

  try {
    await prisma.projectCase.delete({
      where: { id }
    });
    revalidatePath("/skills");
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete project case:", error);
    return { ok: false, error: "Database operation failed." };
  }
}

// Fetch all dynamic skills and cases
export async function getSkillsData() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: "asc" }
    });
    const cases = await prisma.projectCase.findMany({
      orderBy: { createdAt: "desc" }
    });

    return {
      skills: skills.map((s: Skill) => ({ id: s.id, name: s.name })),
      cases: cases.map((c: ProjectCase) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        image: c.image,
        url: c.url,
        techStack: c.techStack,
        linkText: c.linkText,
      }))
    };
  } catch (error) {
    console.error("Failed to load skills details:", error);
    return { skills: [], cases: [] };
  }
}
