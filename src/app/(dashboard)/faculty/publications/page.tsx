import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { PublicationsClient } from "./PublicationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Workspace — Publications" };

export default async function FacultyPublicationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch publications for current user from database
  const publications = await db.publication.findMany({
    where: {
      authorId: session.user.id,
      deletedAt: null,
    },
    orderBy: { year: "desc" },
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace", href: "/faculty" },
          { label: "Publications" },
        ]}
        title="Research & Academic Publications Registry"
        subtitle="Departmental dossier of indexed journals, peer-reviewed conference proceedings, and patents for NBA/NAAC compliance."
      />

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
