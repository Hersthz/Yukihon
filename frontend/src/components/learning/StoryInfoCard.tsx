import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StoryInfoCardProps {
  children: ReactNode;
  className?: string;
}

const StoryInfoCard = ({ children, className }: StoryInfoCardProps) => (
  <div
    className={cn(
      "rounded-[18px] border border-border bg-card px-4 py-3 text-sm text-foreground",
      className
    )}
  >
    {children}
  </div>
);

export default StoryInfoCard;
