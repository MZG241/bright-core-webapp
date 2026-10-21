import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";


export const employmentTypeEnum = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);

export const jobStatusEnum = pgEnum("job_status", ["OPEN", "CLOSED"]);

export const applicationStatusEnum = pgEnum("application_status", [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
]);


export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("ADMIN"),
  resetCodeHash: text("reset_code_hash"),
  resetCodeExpiresAt: timestamp("reset_code_expires_at", {
    withTimezone: true,
  }),
  resetCodeAttempts: integer("reset_code_attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});


export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(), 
    location: text("location").notNull(),
    employmentType: employmentTypeEnum("employment_type").notNull(),
    description: text("description").notNull(),
    requirements: jsonb("requirements")
  .$type<string[]>()
  .notNull()
  .default([]),
    closingDate: timestamp("closing_date", { withTimezone: true }).notNull(),
    status: jobStatusEnum("status").notNull().default("OPEN"),
    viewsCount: integer("views_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("jobs_slug_unique").on(table.slug),
    index("jobs_status_idx").on(table.status),
    index("jobs_closing_date_idx").on(table.closingDate),
  ]
);


export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    coverNote: text("cover_note"),
    cvFileId: text("cv_file_id").notNull(),
    cvFileName: text("cv_file_name").notNull(),
    status: applicationStatusEnum("status").notNull().default("PENDING"),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("applications_job_email_unique").on(table.jobId, table.email),
    index("applications_job_id_idx").on(table.jobId),
    index("applications_status_idx").on(table.status),
    index("applications_created_at_idx").on(table.createdAt),
  ]
);


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;