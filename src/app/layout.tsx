import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Etimad Tender Intelligence",
  description: "Discover relevant Saudi government tenders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
