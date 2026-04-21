import { ReactNode, useEffect, useState } from "react";

import DashboardNavigation from "@/components/DashboardNavigation";
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
    setCollapsed((previous) => {
      const next = !previous;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffaf4_0%,#fff5ed_42%,#f8f0e8_100%)]" />
        <div className="absolute left-[-8rem] top-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[#ffd8cf]/70 blur-[120px]" />
        <div className="absolute right-[-5rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-[#bfeefe]/70 blur-[120px]" />
        <div className="absolute bottom-[-8rem] left-[20%] h-[16rem] w-[16rem] rounded-full bg-[#c7ffc6]/60 blur-[120px]" />
        <div className="absolute inset-0 opacity-70 bg-noise" />
      </div>

      <DashboardNavigation collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />

      <main
        className={cn(
          "relative pt-[112px] transition-[padding] duration-300",
          collapsed ? "lg:pl-[112px]" : "lg:pl-[296px]"
        )}
      >
        <div
          className="mx-auto w-full max-w-[1680px] px-4 pb-8 sm:px-5 lg:px-6 xl:px-8"
        >
          <div
            className={cn(
              "min-h-[calc(100vh-136px)] rounded-[2rem] px-0",
              collapsed ? "lg:ml-2" : "lg:ml-3"
            )}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
