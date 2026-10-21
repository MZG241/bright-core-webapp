import { sanitizeRichText } from "@/app/lib/sanitize";
import { describe, it, expect } from "vitest";


describe("sanitizeRichText", () => {
  it("keeps safe tags", () => {
    const html = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps lists", () => {
    const html = "<ul><li>One</li><li>Two</li></ul>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps headings", () => {
    const html = "<h2>Title</h2><h3>Subtitle</h3>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("strips script tags", () => {
    const html = "<p>Hello</p><script>alert('xss')</script>";
    const clean = sanitizeRichText(html);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("alert");
  });

  it("strips event handlers", () => {
    const html = '<p onclick="alert(1)">Click</p>';
    const clean = sanitizeRichText(html);
    expect(clean).not.toContain("onclick");
  });

  it("adds rel and target to links", () => {
    const html = '<a href="https://example.com">Link</a>';
    const clean = sanitizeRichText(html);
    expect(clean).toContain('rel="noopener noreferrer"');
    expect(clean).toContain('target="_blank"');
  });

  it("strips javascript: URLs", () => {
    const html = '<a href="javascript:alert(1)">Link</a>';
    const clean = sanitizeRichText(html);
    expect(clean).not.toContain("javascript:");
  });

  it("strips iframe tags", () => {
    const html = '<iframe src="https://evil.com"></iframe>';
    const clean = sanitizeRichText(html);
    expect(clean).not.toContain("<iframe");
  });

  it("strips style attributes", () => {
    const html = '<p style="color:red">Text</p>';
    const clean = sanitizeRichText(html);
    expect(clean).not.toContain("style=");
  });

  it("strips unknown tags", () => {
    const html = "<marquee>Hello</marquee>";
    const clean = sanitizeRichText(html);
    expect(clean).not.toContain("<marquee");
    expect(clean).toContain("Hello");
  });

  it("keeps blockquotes", () => {
    const html = "<blockquote>Quote</blockquote>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps code blocks", () => {
    const html = "<pre><code>const x = 1;</code></pre>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps horizontal rules", () => {
    const html = "<p>Before</p><hr /><p>After</p>";
    expect(sanitizeRichText(html)).toBe(html);
  });
});