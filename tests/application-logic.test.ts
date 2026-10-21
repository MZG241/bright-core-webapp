import { canApplyToJob, isJobOpen } from "@/app/lib/application-logic";
import { describe, it, expect } from "vitest";

describe("isJobOpen", () => {
  it("returns true for an OPEN job with a future closing date", () => {
    const future = new Date(Date.now() + 86400000);
    expect(isJobOpen("OPEN", future)).toBe(true);
  });

  it("returns false for a CLOSED job", () => {
    const future = new Date(Date.now() + 86400000);
    expect(isJobOpen("CLOSED", future)).toBe(false);
  });

  it("returns false for an OPEN job past its closing date", () => {
    const past = new Date(Date.now() - 86400000);
    expect(isJobOpen("OPEN", past)).toBe(false);
  });
});

describe("canApplyToJob", () => {
  it("allows applying to an OPEN job with a future date", () => {
    const future = new Date(Date.now() + 86400000);
    expect(canApplyToJob("OPEN", future)).toEqual({ allowed: true });
  });

  it("rejects a CLOSED job", () => {
    const future = new Date(Date.now() + 86400000);
    const result = canApplyToJob("CLOSED", future);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("closed");
  });

  it("rejects an OPEN job past its closing date", () => {
    const past = new Date(Date.now() - 86400000);
    const result = canApplyToJob("OPEN", past);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("closing date");
  });
});