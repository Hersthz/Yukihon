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
    <div className="min-h-screen bg-background text-foreground">
      {/* Background layers — theme-aware */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Light mode: warm cream gradient / Dark mode: deep navy gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        {/* Colored ambient blobs — subtle */}
        <div className="absolute left-[10%] top-[8%] h-[18rem] w-[18rem] rounded-full bg-primary/8 blur-[110px]" />
        <div className="absolute bottom-[5%] right-[10%] h-[16rem] w-[16rem] rounded-full bg-accent-warm/8 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.25] bg-noise" />
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
          <div className="rounded-[1.75rem] border-2 border-border/50 bg-card/20 p-3 backdrop-blur-[8px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
