import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devonboard AI",
  description: "AI-powered developer onboarding platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
