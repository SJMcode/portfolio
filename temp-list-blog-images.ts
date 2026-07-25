import "dotenv/config";
import { prisma } from "./lib/prisma";

async function main() {
  const posts = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      image: true,
    }
  });
  console.log("Current Database Blog Posts:");
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
