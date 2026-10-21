import { z } from "zod";

export const employmentTypeValues = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
] as const;

export const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  location: z.string().min(2, "Location is required").max(120),
  employmentType: z.enum(employmentTypeValues, {
    message: "Choose an employment type",
  }),
  description: z
    .string()
    .min(20, "Description is too short")
    .max(20_000, "Description is too long"),
  requirements: z
    .array(z.string().min(1).max(200))
    .min(1, "Add at least one requirement")
    .max(20, "Maximum 20 requirements"),
  closingDate: z
    .string()
    .min(1, "Closing date is required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date")
    .refine((v) => {
      const d = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d.getTime() >= today.getTime();
    }, "Closing date must be today or in the future"),
});



export type JobInput = z.infer<typeof jobSchema>;