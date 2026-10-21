import { applicationSchema, validateCvFile } from "@/app/lib/validations/application";
import { loginSchema } from "@/app/lib/validations/auth";
import { jobSchema } from "@/app/lib/validations/job";
import { passwordSchema } from "@/app/lib/validations/profile";
import { describe, it, expect } from "vitest";

describe("applicationSchema", () => {
  it("accepts a valid application", () => {
    const result = applicationSchema.safeParse({
      fullName: "Georges MZ",
      email: "georges@example.com",
      phone: "+250 788 123 456",
      coverNote: "I'd love to join.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name that's too short", () => {
    const result = applicationSchema.safeParse({
      fullName: "J",
      email: "georges@example.com",
      phone: "+250 788 123 456",
      coverNote: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["fullName"]);
    }
  });

  it("rejects an invalid email", () => {
    const result = applicationSchema.safeParse({
      fullName: "Georges MZ",
      email: "not-an-email",
      phone: "+250 788 123 456",
      coverNote: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone format", () => {
    const result = applicationSchema.safeParse({
      fullName: "Georges MZ",
      email: "georges@example.com",
      phone: "abc-def",
      coverNote: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty cover note", () => {
    const result = applicationSchema.safeParse({
      fullName: "Georges MZ",
      email: "georges@example.com",
      phone: "+250 788 123 456",
      coverNote: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("validateCvFile", () => {
  function makeFile(name: string, type: string, size: number): File {
    return new File([new Uint8Array(size)], name, { type });
  }

  it("accepts a valid PDF under 5 MB", () => {
    const file = makeFile("cv.pdf", "application/pdf", 1024 * 1024);
    expect(validateCvFile(file)).toBeNull();
  });

  it("rejects when no file is provided", () => {
    expect(validateCvFile(null)).toBe("Please upload your CV (PDF).");
  });

  it("rejects an empty file", () => {
    const file = makeFile("cv.pdf", "application/pdf", 0);
    expect(validateCvFile(file)).toBe("Please upload your CV (PDF).");
  });

  it("rejects a non-PDF file", () => {
    const file = makeFile("cv.docx", "application/msword", 1024);
    expect(validateCvFile(file)).toBe("CV must be a PDF file.");
  });

  it("rejects a PDF larger than 5 MB", () => {
    const file = makeFile("cv.pdf", "application/pdf", 6 * 1024 * 1024);
    expect(validateCvFile(file)).toBe("CV must be 5 MB or smaller.");
  });
});

describe("jobSchema", () => {
  const valid = {
    title: "Senior Developer",
    location: "Kigali",
    employmentType: "FULL_TIME" as const,
    description: "A long enough description for the role.",
    requirements: ["5+ years of experience", "Strong React knowledge"],
    closingDate: "2030-12-31",
  };

  it("accepts a valid job", () => {
    expect(jobSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a title that's too short", () => {
    const result = jobSchema.safeParse({ ...valid, title: "X" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown employment type", () => {
    const result = jobSchema.safeParse({ ...valid, employmentType: "FREELANCE" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid closing date", () => {
    const result = jobSchema.safeParse({ ...valid, closingDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects a closing date in the past", () => {
    const result = jobSchema.safeParse({
      ...valid,
      closingDate: "2020-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a description that's too short", () => {
    const result = jobSchema.safeParse({ ...valid, description: "Too short" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty requirements array", () => {
    const result = jobSchema.safeParse({ ...valid, requirements: [] });
    expect(result.success).toBe(false);
  });

  it("rejects requirements with more than 20 items", () => {
    const result = jobSchema.safeParse({
      ...valid,
      requirements: Array.from({ length: 21 }, (_, i) => `Requirement ${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid login", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "secret" }).success
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success
    ).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a strong password", () => {
    const result = passwordSchema.safeParse({
      currentPassword: "old",
      newPassword: "Strong123",
      confirmPassword: "Strong123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password without an uppercase letter", () => {
    const result = passwordSchema.safeParse({
      currentPassword: "old",
      newPassword: "weak1234",
      confirmPassword: "weak1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when passwords don't match", () => {
    const result = passwordSchema.safeParse({
      currentPassword: "old",
      newPassword: "Strong123",
      confirmPassword: "Different456",
    });
    expect(result.success).toBe(false);
  });
});