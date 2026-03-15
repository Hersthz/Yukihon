import { ReactNode } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import SnowEffect from "@/components/SnowEffect";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#07111d_0%,#0a1422_20%,#0d1724_50%,#0f1a28_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.12),transparent_25%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_16%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.08),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(196,181,253,0.06),transparent_18%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div className="absolute inset-0 opacity-[0.04] bg-noise" />
        <div className="absolute left-[8%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-sky-300/[0.05] blur-[150px]" />
        <div className="absolute bottom-[8%] right-[8%] h-[22rem] w-[22rem] rounded-full bg-cyan-200/[0.05] blur-[140px]" />
      </div>

      <SnowEffect count={14} className="opacity-60" />
      <div className="fixed inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-slate-50/[0.03] via-transparent to-transparent" />

      <DashboardNavigation />

      <main className="relative z-10 pt-[88px] lg:pl-[288px]">
        <div className="min-h-[calc(100vh-88px)] px-4 pb-12 sm:px-6 lg:px-8 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
