import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const client = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client,
});

(async () => {
  try {
    await client`SELECT 1`;

    console.log("Connected successfully to DATABASE");
  } catch (error) {
    console.error("Failed to connect to DATABASE:", error);
  }
})();