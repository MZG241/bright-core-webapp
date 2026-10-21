import { generateSlug, uniqueSlug } from "@/app/lib/slug";
import { describe, it, expect } from "vitest";


describe("generateSlug", () => {
  it("lowercases and hyphenates a normal title", () => {
    expect(generateSlug("Senior Full Stack Developer")).toBe(
      "senior-full-stack-developer"
    );
  });

  it("removes accents", () => {
    expect(generateSlug("Développeur")).toBe("developpeur");
  });

  it("falls back to a random hex slug when the title has no letters", () => {
    const slug = generateSlug("!!!");
    expect(slug).toMatch(/^job-[a-f0-9]{8}$/);
  });

  it("falls back for emoji-only titles", () => {
    const slug = generateSlug("🚀🚀🚀");
    expect(slug).toMatch(/^job-[a-f0-9]{8}$/);
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug if it's not taken", () => {
    expect(uniqueSlug("developer", [])).toBe("developer");
  });

  it("appends -2 if the base is taken", () => {
    expect(uniqueSlug("developer", ["developer"])).toBe("developer-2");
  });

  it("appends -3 if -2 is also taken", () => {
    expect(uniqueSlug("developer", ["developer", "developer-2"])).toBe(
      "developer-3"
    );
  });
});