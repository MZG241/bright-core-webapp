import { z } from "zod";

const MAX_CV_SIZE = 5 * 1024 * 1024;

export const applicationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s\-()]+$/, "Enter a valid phone number"),
  coverNote: z
    .string()
    .max(2000, "Cover note must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function validateCvFile(file: File | null): string | null {
  if (!file || file.size === 0) return "Please upload your CV (PDF).";
  if (file.type !== "application/pdf") return "CV must be a PDF file.";
  if (file.size > MAX_CV_SIZE) return "CV must be 5 MB or smaller.";
  return null;
}