import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Split",
  description: "Split your study time by difficulty, one timer per subject.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
