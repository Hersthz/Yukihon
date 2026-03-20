import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

interface PageSectionProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  className?: string;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export const PageHeader = ({
  icon,
  title,
  description,
  eyebrow,
  action,
}: PageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
  >
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-card yukihon-card-flat">
        {icon}
      </div>
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[1.85rem] font-semibold leading-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
    {action && <div className="flex flex-wrap gap-2">{action}</div>}
  </motion.div>
);

export const PageSection = ({
  title,
  description,
  action,
  children,
  className,
}: PageSectionProps) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "yukihon-card-sm p-4 cursor-default",
      className
    )}
  >
    {(title || description || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </motion.section>
);

export const MetricCard = ({
  label,
  value,
  icon,
  hint,
  className,
}: MetricCardProps) => (
  <div
    className={cn(
      "yukihon-card-flat px-4 py-4 cursor-default",
      className
    )}
  >
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      {icon}
    </div>
    <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-[1.25rem] border-2 border-dashed border-border bg-muted/30 px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
      {icon}
    </div>
    <p className="text-base font-semibold text-foreground">{title}</p>
    {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
  </div>
);
