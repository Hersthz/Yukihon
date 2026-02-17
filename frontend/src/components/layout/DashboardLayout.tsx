// src/components/layout/DashboardLayout.tsx

import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 dark:from-slate-950 dark:to-slate-900">
      <Navigation />
      <main className="flex-1 overflow-auto">{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
