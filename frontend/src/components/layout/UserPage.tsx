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
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
  >
    <div className="flex items-start gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] border-2 border-[hsl(var(--card-border-color))] bg-[#ffd8cf] shadow-[0_8px_0_0_hsl(var(--card-border-color))]">
        {icon}
      </div>

      <div className="max-w-3xl">
        {eyebrow && <p className="section-kicker mb-3">{eyebrow}</p>}
        <h2 className="display-font text-[2.6rem] leading-none text-foreground md:text-[3.3rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            {description}
          </p>
        )}
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
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("yukihon-card-sm p-5 cursor-default md:p-6", className)}
  >
    {(title || description || action) && (
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          {title && <h3 className="text-xl font-semibold text-foreground">{title}</h3>}
          {description && (
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </motion.section>
);

export const MetricCard = ({ label, value, icon, hint, className }: MetricCardProps) => (
  <div className={cn("yukihon-card-flat px-4 py-4 cursor-default md:px-5", className)}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-3 text-3xl font-semibold leading-none text-foreground">{value}</div>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#e9f7ff] text-primary">
        {icon}
      </div>
    </div>
    {hint && <p className="mt-3 text-sm leading-6 text-muted-foreground">{hint}</p>}
  </div>
);

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-[1.7rem] border-2 border-dashed border-border bg-white/75 px-6 py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-[#eef8ff] text-primary">
      {icon}
    </div>
    <p className="text-lg font-semibold text-foreground">{title}</p>
    {description && (
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
    )}
  </div>
);
