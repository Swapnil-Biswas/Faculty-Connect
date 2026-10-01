import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PublicationsClient } from "./PublicationsClient";

export default async function FacultyPublicationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch publications for current user
  const publications = await db.publication.findMany({
    where: {
      authorId: session.user.id,
      deletedAt: null,
    },
    orderBy: { year: "desc" },
  });

  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Research & Publications Portfolio</h1>
        <p className="page-subtitle">
          Track published journals, peer-reviewed conferences, book chapters, and patents for NBA/NAAC criteria.
        </p>
      </div>

      <PublicationsClient
        initialPublications={publications.map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          journal: p.journal,
          conference: p.conference,
          year: p.year,
          doi: p.doi,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
