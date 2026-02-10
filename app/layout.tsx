import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulsePlan | Mobile Workout Planner",
  description: "Build and manage a personal workout schedule optimized for mobile."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
