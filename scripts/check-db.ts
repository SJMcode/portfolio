import "dotenv/config";
import { prisma } from "../lib/prisma";

async function checkDb() {
  try {
    console.log("Connecting to database using current env settings...");
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
      },
      orderBy: { id: "asc" }
    });

    console.log(`Database query succeeded! Found ${posts.length} posts:`);
    posts.forEach((post) => {
      console.log(`- [ID: ${post.id}] Title: "${post.title}" (Category: ${post.category})`);
    });
  } catch (error) {
    console.error("Database query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
