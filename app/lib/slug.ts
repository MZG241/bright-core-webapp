
import { randomBytes } from "crypto";
import slugify from "slugify";

export function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true }).trim();
  if (base.length > 0) return base;
  return `job-${randomBytes(4).toString("hex")}`;
}

export function uniqueSlug(
  base: string,
  existing: string[]
): string {
  if (!existing.includes(base)) return base;
  let suffix = 2;
  while (existing.includes(`${base}-${suffix}`)) {
    suffix++;
  }
  return `${base}-${suffix}`;
}