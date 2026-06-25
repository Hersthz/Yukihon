import { type CSSProperties, ReactNode, useEffect, useState } from "react";

import DashboardNavigation, {
  SIDEBAR_COLLAPSED,
  SIDEBAR_EXPANDED,
  TOPBAR_HEIGHT,
} from "@/components/DashboardNavigation";
import AppWinterBackground from "@/components/layout/AppWinterBackground";
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
    <div className="min-h-screen bg-transparent text-foreground">
      <AppWinterBackground />
      <DashboardNavigation collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />

      <main
        className={cn("transition-[padding] duration-300")}
        style={{ paddingTop: TOPBAR_HEIGHT }}
      >
        <div
          className="transition-[padding] duration-300 lg:[padding-left:var(--sidebar-w)]"
          style={
            {
              "--sidebar-w": `${collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED}px`,
            } as CSSProperties
          }
        >
          <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
