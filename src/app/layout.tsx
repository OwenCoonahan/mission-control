import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Control | Owen",
  description: "Personal command center for goals, tasks, and progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <SidebarProvider defaultOpen={true}>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
