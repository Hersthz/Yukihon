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

export const PageHeader = ({ icon, title, description, eyebrow, action }: PageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
  >
    <div className="flex items-start gap-3.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
    </div>

    {action && <div className="flex flex-wrap items-center gap-2 md:pt-1">{action}</div>}
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
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={cn("yukihon-card-sm p-5 md:p-6", className)}
  >
    {(title || description || action) && (
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          {title && (
            <h2 className="text-[1.05rem] font-bold tracking-tight text-foreground">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </motion.section>
);

export const MetricCard = ({ label, value, icon, hint, className }: MetricCardProps) => (
  <div
    className={cn("yukihon-card-flat px-4 py-4 transition-all hover:-translate-y-0.5", className)}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-2 text-[1.7rem] font-bold leading-none tracking-tight text-foreground">
          {value}
        </div>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
        {icon}
      </div>
    </div>
    {hint && <p className="mt-2.5 text-xs leading-5 text-muted-foreground">{hint}</p>}
  </div>
);

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
      {icon}
    </div>
    <p className="text-base font-semibold text-foreground">{title}</p>
    {description && (
      <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    )}
  </div>
);
