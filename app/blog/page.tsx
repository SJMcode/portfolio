import { prisma } from "@/lib/prisma";
import { BlogClient, BlogPost } from "./BlogClient";

// Static fallback posts to display if the database has not been seeded yet
const STATIC_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Optimizing PostgreSQL Query Performance",
    category: "Backend & Databases",
    date: "2026-07-10",
    readTime: "4 min read",
    excerpt: "Database latency can kill user experience. Here is how we diagnosed slow queries, introduced indexing strategies, and optimized connections in our Node/Postgres stack.",
    content: `In production environments, database response time is often the main bottleneck. During my work with transactional backends, we noticed page loads lagging due to slow API queries. Here is the step-by-step optimization roadmap we executed:

1. Query Diagnosis with EXPLAIN ANALYZE: We ran query plans on our slowest endpoints to check for sequential scans.
2. Strategic Indexing: We introduced B-Tree indexes on foreign keys and created Composite Indexes for queries filtering on multiple columns.
3. Connection Pool Tuning: We adjusted our client pooling parameters to avoid running out of active connections under peak traffic.

The Result: We achieved a 45% reduction in database query latency, going from 180ms down to less than 100ms average response time.`
  },
  {
    id: 2,
    title: "Machine Learning Task Offloading in Industrial IoT",
    category: "IoT & Cloud Computing",
    date: "2026-06-28",
    readTime: "6 min read",
    excerpt: "An overview of my academic research at Stockholm University, implementing Edge-Cloud resource balancing configurations using optimization models.",
    content: `Industrial IoT networks generate massive streams of data that require low-latency processing. Standard cloud computing solutions can introduce network delays.

In my Master's Thesis at Stockholm University, I designed a resource balancing framework that decides which ML processing tasks should be executed at the edge (closer to the sensor) vs. the cloud. Using mathematical optimization models, we balanced latency constraints against edge power capacities. The system dynamically offloads heavy compute tasks to cloud instances, ensuring real-time response rates for critical safety tasks.`
  }
];

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  
  try {
    // Fetch posts directly from the PostgreSQL database using Prisma on the server
    const dbPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    posts = dbPosts.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      date: p.date,
      readTime: p.readTime,
      excerpt: p.excerpt,
      content: p.content
    }));
  } catch (error) {
    console.warn("Could not query blog database, falling back to static posts.", error);
  }

  // Fallback to static articles if the database is empty
  const displayPosts = posts.length > 0 ? posts : STATIC_POSTS;

  return <BlogClient initialPosts={displayPosts} />;
}
