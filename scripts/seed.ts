/**
 * Admin Bootstrap Seed Script
 *
 * Run: npx ts-node --project tsconfig.json scripts/seed.ts
 * Or:  npx tsx scripts/seed.ts
 *
 * Creates the initial ADMIN user, default ScoringConfig, and default NotificationRules.
 * ADMIN is provisioned outside the normal app flow — only via this script or env-based bootstrap.
 */

import { PrismaClient, Role, NotificationEventType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@facultyconnect.edu";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@123";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "System Administrator";

async function main() {
  console.log("?? Seeding Faculty Connect database...\n");

  // -- 1. Create Admin User ----------------------------------------------------
  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`? Admin user already exists: ${ADMIN_EMAIL}`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await db.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: Role.ADMIN,
        designation: "System Administrator",
      },
    });
    console.log(`? Admin created: ${admin.email} (id: ${admin.id})`);

    // -- 2. Default ScoringConfig ----------------------------------------------
    await db.scoringConfig.create({
      data: {
        version: 1,
        setByAdminId: admin.id,
        isActive: true,
        // All weights use defaults from schema
      },
    });
    console.log("? Default ScoringConfig v1 created");

    // -- 3. Default NotificationRules -----------------------------------------
    const defaultRules = Object.values(NotificationEventType).map((eventType) => ({
      eventType,
      enabled: true,
      threshold:
        eventType === NotificationEventType.LEADERBOARD_REFRESHED ? 5 : null,
    }));

    for (const rule of defaultRules) {
      await db.notificationRule.upsert({
        where: { eventType: rule.eventType },
        create: rule,
        update: {},
      });
    }
    console.log("? Default NotificationRules created");

    // -- 4. Sample Badges -----------------------------------------------------
    const badges = [
      {
        name: "Early Bird",
        description: "Completed 5 tasks before deadline",
        rule: { type: "TASKS_EARLY", threshold: 5 },
      },
      {
        name: "Consistent Performer",
        description: "Maintained a 7-day task completion streak",
        rule: { type: "STREAK_DAYS", threshold: 7 },
      },
      {
        name: "Research Star",
        description: "Published 3 research papers",
        rule: { type: "PUBLICATIONS", threshold: 3 },
      },
      {
        name: "Perfect Score",
        description: "Received 5/5 in all evaluation criteria",
        rule: { type: "PERFECT_EVALUATION", threshold: 1 },
      },
      {
        name: "Century Club",
        description: "Earned 100 points total",
        rule: { type: "TOTAL_POINTS", threshold: 100 },
      },
    ];

    for (const badge of badges) {
      await db.badge.upsert({
        where: { name: badge.name },
        create: badge,
        update: {},
      });
    }
    console.log("? Sample badges created");
  }

  // -- 5. Demo Cluster + Faculty (for development only) ---------------------
  if (process.env.SEED_DEMO === "true") {
    const admin = await db.user.findUniqueOrThrow({ where: { email: ADMIN_EMAIL } });

    // Create HOD
    const hod = await db.user.upsert({
      where: { email: "hod@facultyconnect.edu" },
      create: {
        name: "Dr. Priya Sharma",
        email: "hod@facultyconnect.edu",
        passwordHash: await bcrypt.hash("Hod@123", 12),
        role: Role.HOD,
        designation: "Head of Department",
      },
      update: {},
    });
    console.log(`? HOD: ${hod.email}`);

    // Create Cluster
    const cluster = await db.cluster.upsert({
      where: { id: "cluster-alpha" },
      create: {
        id: "cluster-alpha",
        name: "Alpha Cluster",
        description: "Core CS Faculty Group",
      },
      update: {},
    });

    // Create Cluster Head
    const clusterHead = await db.user.upsert({
      where: { email: "ch@facultyconnect.edu" },
      create: {
        name: "Prof. Rajan Mehta",
        email: "ch@facultyconnect.edu",
        passwordHash: await bcrypt.hash("Ch@123", 12),
        role: Role.CLUSTER_HEAD,
        designation: "Associate Professor",
      },
      update: {},
    });

    // Link cluster head
    await db.cluster.update({
      where: { id: cluster.id },
      data: { headId: clusterHead.id },
    });

    await db.clusterMembership.upsert({
      where: { userId_clusterId: { userId: clusterHead.id, clusterId: cluster.id } },
      create: { userId: clusterHead.id, clusterId: cluster.id },
      update: {},
    });
    console.log(`? Cluster Head: ${clusterHead.email}`);

    // Create Faculty members
    const facultyData = [
      { name: "Dr. Ananya Iyer", email: "ananya@facultyconnect.edu", designation: "Assistant Professor" },
      { name: "Prof. Siddharth Roy", email: "siddharth@facultyconnect.edu", designation: "Assistant Professor" },
      { name: "Dr. Kavita Patel", email: "kavita@facultyconnect.edu", designation: "Lecturer" },
    ];

    for (const f of facultyData) {
      const faculty = await db.user.upsert({
        where: { email: f.email },
        create: {
          ...f,
          passwordHash: await bcrypt.hash("Faculty@123", 12),
          role: Role.FACULTY,
        },
        update: {},
      });
      await db.clusterMembership.upsert({
        where: { userId_clusterId: { userId: faculty.id, clusterId: cluster.id } },
        create: { userId: faculty.id, clusterId: cluster.id },
        update: {},
      });
      console.log(`? Faculty: ${faculty.email}`);
    }
  }

  console.log("\n?? Seed complete!");
}

main()
  .catch((e) => {
    console.error("? Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
