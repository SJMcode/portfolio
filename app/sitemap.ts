import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Base routes
  const routes = ["", "/skills", "/guestbook", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch blog posts from database to include them dynamically
  let blogUrls: any[] = [];
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    });

    blogUrls = posts.map((post) => ({
      url: `${baseUrl}/blog`, // Keep basic blog route for crawling or custom params if needed
      lastModified: post.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.warn("Could not fetch blog posts for sitemap generation:", error);
  }

  return [...routes, ...blogUrls];
}
