import { prisma } from "@/lib/prisma";
import { GuestbookClient, GuestbookEntry } from "./GuestbookClient";

export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  let entries: GuestbookEntry[] = [];

  try {
    // Fetch signatures from PostgreSQL database using Prisma, joining User information and replies
    const dbEntries = await prisma.guestbook.findMany({
      where: {
        parentId: null
      },
      include: {
        user: {
          select: {
            image: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                image: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    entries = dbEntries.map((e) => ({
      id: e.id,
      name: e.name,
      text: e.text,
      createdAt: e.createdAt.toISOString(),
      userImage: e.user?.image || null,
      replies: e.replies.map((r) => ({
        id: r.id,
        name: r.name,
        text: r.text,
        createdAt: r.createdAt.toISOString(),
        userImage: r.user?.image || null
      }))
    }));
  } catch (error) {
    console.warn("Could not query guestbook database, falling back to empty entries.", error);
  }

  return <GuestbookClient initialMessages={entries} />;
}
