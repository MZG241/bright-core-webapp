export type JobStatus = "OPEN" | "CLOSED";

export function isJobOpen(
  status: JobStatus,
  closingDate: Date,
  now: Date = new Date()
): boolean {
  if (status === "CLOSED") return false;
  return closingDate.getTime() >= now.getTime();
}

export function canApplyToJob(
  status: JobStatus,
  closingDate: Date,
  now: Date = new Date()
): { allowed: boolean; reason?: string } {
  if (status === "CLOSED") {
    return { allowed: false, reason: "This job is closed." };
  }
  if (closingDate.getTime() < now.getTime()) {
    return { allowed: false, reason: "The closing date has passed." };
  }
  return { allowed: true };
}