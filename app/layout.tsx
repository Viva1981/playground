import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Ez a sor tölti be a dizájnt!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UI Design Playground",
  description: "Interaktív React Design Rendszer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className={inter.className}>{children}</body>
    </html>
  );
}