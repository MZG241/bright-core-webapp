import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import slugify from "slugify";
import { db } from "./index";
import { users, jobs } from "./schema";

async function seed() {
  console.log("Start Seeding...");

  const adminEmail = "admin@brightcore.test";
  const adminPassword = "Admin12345";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash,
      name: "BrightCore Admin",
      role: "ADMIN",
    })
    .onConflictDoNothing({ target: users.email });

  console.log(`Admin: ${adminEmail} / ${adminPassword}`);

  const now = new Date();
  const daysFromNow = (n: number) =>
    new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const sampleJobs = [
    {
      title: "Senior Full Stack Developer",
      location: "Kigali, Rwanda",
      employmentType: "FULL_TIME" as const,
      description:
        "<p>We are looking for a Senior Full Stack Developer to join our growing engineering team. You will design, build and maintain scalable web applications used by thousands of members across the network.</p>",
      requirements: [
        "5+ years of experience with JavaScript/TypeScript",
        "Strong knowledge of React and Node.js",
        "Experience with PostgreSQL and ORMs",
        "Familiarity with cloud deployments (AWS, Vercel or similar)",
        "Excellent communication skills in English and Kinyarwanda",
      ],
      closingDate: daysFromNow(30),
      status: "OPEN" as const,
    },
    {
      title: "Product Designer",
      location: "Kigali, Rwanda",
      employmentType: "CONTRACT" as const,
      description:
        "<p>We are seeking a Product Designer to shape the experience of our member-facing applications. You will work closely with engineers and product managers to deliver clean, accessible interfaces.</p>",
      requirements: [
        "3+ years of product design experience",
        "Proficiency with Figma and design systems",
        "Portfolio showing mobile-first responsive work",
        "Ability to run user research sessions",
      ],
      closingDate: daysFromNow(21),
      status: "OPEN" as const,
    },
    {
      title: "Customer Support Officer",
      location: "Huye, Rwanda",
      employmentType: "FULL_TIME" as const,
      description:
        "<p>Join our member support team to help SACCO members with their daily questions about loans, savings and mobile money operations. You will be the first point of contact for our members.</p>",
      requirements: [
        "1+ year of experience in customer support",
        "Excellent written and verbal communication",
        "Comfortable with ticketing systems and CRM tools",
        "Fluency in English and Kinyarwanda (French is a plus)",
      ],
      closingDate: daysFromNow(14),
      status: "OPEN" as const,
    },
  ];

  for (const job of sampleJobs) {
    const slug = slugify(job.title, { lower: true, strict: true });
    await db
      .insert(jobs)
      .values({ ...job, slug })
      .onConflictDoUpdate({
        target: jobs.slug,
        set: {
          title: job.title,
          location: job.location,
          employmentType: job.employmentType,
          description: job.description,
          requirements: job.requirements,
          closingDate: job.closingDate,
          status: job.status,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`${sampleJobs.length} jobs seeded`);
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});