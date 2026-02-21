// src/components/layout/DashboardLayout.tsx

import { ReactNode } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import SnowEffect from "@/components/SnowEffect";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Layered background */}
      <div className="fixed inset-0 z-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0d1525] to-[#0a1628]" />
        {/* Subtle radial accents */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[150px]" />
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* Gentle snow */}
      <SnowEffect count={25} />

      {/* Navigation */}
      <DashboardNavigation />

      {/* Main content */}
      <main className="relative z-10 flex-1 pt-20">
        {children}
      </main>

      {/* Dashboard footer */}
      <footer className="relative z-10 border-t border-white/5 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center text-[0.5rem] font-bold text-white">
                日
              </div>
              <span>© 2025 Yukihon. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy</span>
              <span className="text-white/10">•</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms</span>
              <span className="text-white/10">•</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
