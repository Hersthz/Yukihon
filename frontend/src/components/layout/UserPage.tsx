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
      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/70 bg-white/80 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
        {icon}
      </div>
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
            {eyebrow}
          </p>
        )}
        <h2 className="text-[1.85rem] font-semibold leading-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
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
      "rounded-[24px] border border-white/70 bg-white/[0.74] p-4 shadow-[0_12px_30px_rgba(148,163,184,0.12)] backdrop-blur-xl",
      className
    )}
  >
    {(title || description || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
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
      "rounded-[18px] border border-white bg-white/90 px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.10)]",
      className
    )}
  >
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      {icon}
    </div>
    <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

export const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-white/55 px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      {icon}
    </div>
    <p className="text-base font-semibold text-slate-800">{title}</p>
    {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
  </div>
);
