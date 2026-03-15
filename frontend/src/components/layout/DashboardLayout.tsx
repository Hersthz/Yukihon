import { ReactNode, useEffect, useState } from "react";
import DashboardNavigation from "@/components/DashboardNavigation";
import SnowEffect from "@/components/SnowEffect";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const STORAGE_KEY = "yukihon_sidebar_collapsed";

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setCollapsed(stored === "true");
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#edf5ff] text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_38%,#f7f4ff_72%,#fdf6f0_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.30),transparent_30%),radial-gradient(circle_at_top_right,rgba(187,247,208,0.26),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(196,181,253,0.22),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(251,191,183,0.18),transparent_24%)]" />
        <div className="absolute inset-0 opacity-[0.35] bg-noise" />
        <div className="absolute left-[10%] top-[8%] h-[18rem] w-[18rem] rounded-full bg-sky-300/25 blur-[110px]" />
        <div className="absolute bottom-[5%] right-[10%] h-[16rem] w-[16rem] rounded-full bg-violet-300/20 blur-[120px]" />
      </div>

      <SnowEffect count={16} className="opacity-45" />

      <DashboardNavigation collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />

      <main
        className={cn(
          "relative z-10 pt-[76px] transition-[padding] duration-300",
          collapsed ? "lg:pl-[80px]" : "lg:pl-[224px]"
        )}
      >
        <div className="min-h-[calc(100vh-76px)] px-3 pb-6 pt-3 sm:px-4 lg:px-5 xl:px-6">
          <div className="rounded-[28px] border border-white/75 bg-white/[0.34] p-3 shadow-[0_18px_40px_rgba(148,163,184,0.10)] backdrop-blur-[8px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
