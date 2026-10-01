import EmbeddedPostgres from "embedded-postgres";
import fs from "fs";
import path from "path";
import net from "net";

function isPortOpen(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const isRunning = await isPortOpen(5432);
  if (isRunning) {
    console.log("PostgreSQL server is already running on port 5432.");
    return;
  }

  const dataDir = path.resolve("./.db-data");
  const isInitialized = fs.existsSync(path.join(dataDir, "PG_VERSION"));

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: "postgres",
    password: "password",
    persistent: true,
  });

  if (!isInitialized) {
    console.log("Initializing local PostgreSQL data directory...");
    await pg.initialise();
    console.log("Starting local PostgreSQL server...");
    await pg.start();
    console.log("Creating database 'faculty_connect'...");
    try {
      await pg.createDatabase("faculty_connect");
    } catch (e: any) {
      console.log("Database may already exist:", e.message);
    }
  } else {
    console.log("Starting local PostgreSQL server...");
    await pg.start();
  }

  console.log("Local PostgreSQL is running on port 5432!");
  console.log("Press Ctrl+C to stop.");

  // Keep process alive
  await new Promise(() => {});
}

main().catch((err) => {
  console.error("Failed to run local PostgreSQL:", err);
  process.exit(1);
});
