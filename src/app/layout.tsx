import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tennis Coach — Upload Your Swing, Get Pro-Level Analysis",
  description:
    "Upload a video of your tennis swing. AI analyzes your technique in 60 seconds and tells you exactly what to fix. $9/month.",
  openGraph: {
    title: "AI Tennis Coach — Swing Analysis in 60 Seconds",
    description:
      "Can't afford a $100/hr coach? AI analyzes your tennis technique and gives you actionable feedback.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
