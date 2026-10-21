import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrightCore — Recruitment",
  description: "Apply for open roles at BrightCore.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}