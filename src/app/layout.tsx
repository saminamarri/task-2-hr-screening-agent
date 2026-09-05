import type { Metadata } from "next";
import "./globals.css";
import { ClerkProviderWrapper } from "@/components/ClerkProviderWrapper";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "HR Candidate Screening Agent",
  description: "AI-Powered CV Parsing, Match Scoring & Interview Scheduling Dashboard for HR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWrapper>
      <html lang="en">
        <body className="antialiased bg-slate-50 text-slate-900 font-sans flex min-h-screen">
          {/* Dashboard Sidebar */}
          <Sidebar />

          {/* Main Workspace Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
